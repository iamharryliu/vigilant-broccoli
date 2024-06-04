from flask import Blueprint


class HTTP_METHODS:
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"


class HTTP_STATUS_CODES:
    OKAY = 200
    BAD_REQUEST = 400
    UNAUTHORIZED_REQUEST = 401
    FORBIDDEN_REQUEST = 403
    NOT_FOUND_ERROR = 404
    INTERNAL_SERVER_ERROR = 500


class BLUEPRINTS:
    USERS_BLUEPRINT = Blueprint("users", __name__)
    OUTFITS_BLUEPRINT = Blueprint("outfits", __name__)
    IMAGES_BLUEPRINT = Blueprint("images", __name__)
    WEATHER_BLUEPRINT = Blueprint("weather", __name__)
    FILTERS_BLUEPRINT = Blueprint("filters", __name__)
    ADMIN_BLUEPRINT = Blueprint("admin", __name__)
    ERROR_BLUEPRINT = Blueprint("errors", __name__)


class BLUEPRINT_PREFIXES:
    USER = "/users"
    IMAGES = "/images"


class PASSWORD_RESET_ENDPOINTS:
    REQUEST = "/passwordResetRequest"
    VALIDATE_TOKEN = "/checkForValidPasswordResetToken"
    SET_PASSWORD = "/setNewPassword"


class USER_ENDPOINTS:
    LOGIN = "/login"
    REGISTER = "/register"
    LOGIN_STATUS = "/loginStatus"
    LOGOUT = "/logout"
    GET_USER = "/getUser"
    FOLLOW = "/follow"
    UNFOLLOW = "/unfollow"
    REMOVE_FOLLOWER = "/removeFollower"
    DELETE_ACCOUNT = "/deleteAccount"
    UPDATE_PROFILE_IMAGE = "/updateProfileImage"
    PASSWORD_RESET = PASSWORD_RESET_ENDPOINTS
    CHANGE_PASSWORD = "/changePassword"
    CHANGE_USERNAME = "/changeUsername"
    CHANGE_EMAIL = "/changeEmail"
    SET_DEFAULT_LOCATION = "/setDefaultLocation"
    SEARCH_USERS = "/searchUsers"


class OUTFIT_ENDPOINTS:
    CREATE = "/create"
    UPDATE = "/update"
    DELETE = "/delete"
    GET_SWIPABLE_OUTFITS = "/getSwipableOutfits"
    GET_OUTFIT_DETAILS = "/getOutfit"
    LIKE = "/like"
    UNLIKE = "/unlike"
    SWIPE = "/swipe"
    UPDATE_FILTER = "/updateFilter"
    GET_USER_OUTFITS = "/getUserOutfits"


class IMAGE_ENDPOINTS:
    UPLOAD_BASE_64 = "/uploadBase64"


class WEATHER_ENDPOINTS:
    GET_WEATHER_DATA = "/getWeatherData"
    SET_PREFERRED_TEMPERATURE_SCALE = "/setPreferredTemperatureScale"


class ADMIN_USER_ENDOINTS:
    GET_ALL_USERS = "/getAllUsers"
    GET_USER_DETAIL = "/getUser"
    DELETE_USER = "/deleteUser"


class ADMIN_OUTFIT_ENDPOINTS:
    GET_ALL_OUTFITS = "/getAllOutfits"
    GET_OUTFIT = "/getOutfit"
    DELETE_OUTFIT = "/deleteOutfit"


class ADMIN_ENDPOINTS:
    GET_TAGS = "/getTags"
    GET_PROBLEMS = "/getProblems"
    USER = ADMIN_USER_ENDOINTS
    OUTFIT = ADMIN_OUTFIT_ENDPOINTS


SEASONS = ["winter", "spring", "summer", "fall"]
GENDERS = ["masculine", "unisex", "feminine"]
