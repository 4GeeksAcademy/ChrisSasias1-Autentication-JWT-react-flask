"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, User
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_cors import CORS
from flask_bcrypt import Bcrypt

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager


# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)

bcrypt = Bcrypt(app)

# database configuration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


@app.route("/signup", methods=["POST"])
def signup():
    body = request.get_json(silent=True) or {}
    username = (body.get("username") or "").strip()
    email = (body.get("email") or "").strip()
    password = body.get("password") or ""
    if username == "":
        return jsonify({"msg": "You must include a username"}), 400
    if email == "":
        return jsonify({"msg": "Email is required"}), 400
    if password == "":
        return jsonify({"msg": "Password is required"}), 400
    if "@" not in email:
        return jsonify({"msg": "Email is not valid"}), 400
    valid_email = User.query.filter_by(email=email).first()
    if valid_email is not None:
        return jsonify({"msg": "Email already exists"}), 409
    valid_username = User.query.filter_by(username=username).first()
    if valid_username is not None:
        return jsonify({"msg": "Username already exists"}), 409
    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User()
    new_user.username = username
    new_user.email = email
    new_user.password = pw_hash
    new_user.is_active = True
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "New user added successfully"}), 201


@app.route("/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}

    email = (body.get("email") or "").strip()
    password = body.get("password") or ""

    if email == "":
        return jsonify({"msg": "You must include an email"}), 400
    if password == "":
        return jsonify({"msg": "You must include a password"}), 400

    user = User.query.filter_by(email=email).first()
    if user is None:
        return jsonify({"msg": "The email or password are incorrect"}), 401

    is_correct_password = bcrypt.check_password_hash(user.password, password)
    if not is_correct_password:
        return jsonify({"msg": "The email or password are incorrect"}), 401

    token = create_access_token(identity=user.username)

    return jsonify({
        "msg": "Login successful",
        "token": token
    }), 200


@app.route("/private", methods=["GET"])
@jwt_required()
def private():
    user = get_jwt_identity()
    return jsonify({
        "msg": f"Logged in as {user}",
        "username": user
    }), 200


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
