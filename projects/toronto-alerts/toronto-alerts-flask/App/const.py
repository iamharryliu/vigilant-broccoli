class ENVIRONMENT_TYPE:
    TEST = "TEST"
    DIT = "DIT"
    SIT = "SIT"
    PROD = "PROD"


class HTTP_STATUS_CODE:
    OKAY = 200
    BAD_REQUEST = 400
    UNAUTHORIZED_REQUEST = 401
    FORBIDDEN_REQUEST = 403
    NOT_FOUND_ERROR = 404
    INTERNAL_SERVER_ERROR = 500


class ENDPOINT:
    INDEX = "/"
    SUBSCRIBE = "/subscribe"
    UNSUBSCRUBE = "/unsubscribe"
    VERIFY_EMAIL = "/verify"
    BLOGS = "/blogs"
    BLOG = "/blog"
    GET_USERS = "/get_users"
    TTC = "/ttc"
    WEATHER = "/weather"
    DASHBOARD = "/dashboard"
    MORE = "/more"
