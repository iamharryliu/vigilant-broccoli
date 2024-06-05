from App.const import HTTP_STATUS_CODE, EXCEPTION_CODE


class BadRequestException(Exception):
    def __init__(self, *args, **kwargs):
        Exception.__init__(self)
        code = kwargs.pop("code", EXCEPTION_CODE.BAD_REQUEST)
        self.code = code
        self.status_code = HTTP_STATUS_CODE.BAD_REQUEST

    def to_dict(self):
        return {"code": self.code}


class UnauthorizedException(Exception):
    def __init__(self, *args, **kwargs):
        Exception.__init__(self)
        code = kwargs.pop("code", EXCEPTION_CODE.FORBIDDEN_REQUEST)
        self.code = code
        self.status_code = HTTP_STATUS_CODE.FORBIDDEN_REQUEST

    def to_dict(self):
        return {"code": self.code}
