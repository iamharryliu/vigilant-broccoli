class ENVIRONMENT_TYPE:
    TEST = "TEST"
    DIT = "DIT"
    SIT = "SIT"
    PROD = "PROD"


class USER_CONFIG:
    MAX_USERNAME_LENGTH = 30
    MAX_EMAIL_LENGTH = 128
    MAX_PASSWORD_LENGTH = 128


class HTTP_STATUS_CODE:
    OKAY = 200
    BAD_REQUEST = 400
    UNAUTHORIZED_REQUEST = 401
    FORBIDDEN_REQUEST = 403
    NOT_FOUND_ERROR = 404
    INTERNAL_SERVER_ERROR = 500


class EXCEPTION_CODE:
    BAD_REQUEST = "BAD_REQUEST"
    FORBIDDEN_REQUEST = "FORBIDDEN_REQUEST"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
    EXISTING_RESOURCE = "EXISTING_RESOURCE"
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"


class FLASH_CATEGORY:
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    DANGER = "danger"


class USER_TYPE:
    SYSTEM_ADMIN = "SYSTEM_ADMIN"
    USER = "USER"


TOKEN_EXPIRE_TIME_IN_SECONDS = 5 * 60
