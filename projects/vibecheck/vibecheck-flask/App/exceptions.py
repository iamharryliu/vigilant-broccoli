from App.config import HTTP_STATUS_CODES, EXCEPTION_CODES


class BadRequestException(Exception):
    def __init__(self, *args, **kwargs):
        Exception.__init__(self)
        code = kwargs.pop("code", EXCEPTION_CODES.BAD_REQUEST)
        self.code = code
        self.status_code = HTTP_STATUS_CODES.BAD_REQUEST

    def to_dict(self):
        return {"code": self.code}


class UnauthorizedException(Exception):
    def __init__(self, *args, **kwargs):
        Exception.__init__(self)
        code = kwargs.pop("code", EXCEPTION_CODES.FORBIDDEN_REQUEST)
        self.code = code
        self.status_code = HTTP_STATUS_CODES.FORBIDDEN_REQUEST

    def to_dict(self):
        return {"code": self.code}
