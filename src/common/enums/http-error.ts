export enum HTTP_ERROR  {
	'NO_PERMISSION'= 'Bạn không có quyền truy cập vào tài nguyên này',
	'INVALID_CREDENTIALS' = 'Thông tin đăng nhập không chính xác',
	'ACCOUNT_LOCKED' = 'Tài khoản của bạn đã bị khóa',
	'ACCOUNT_DISABLED' = 'Tài khoản của bạn đã bị vô hiệu hóa',
	'TOKEN_EXPIRED' = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
	'TOKEN_INVALID' = 'Phiên đăng nhập không hợp lệ',
	'SESSION_EXPIRED' = 'Phiên làm việc đã hết hạn',
	'INSUFFICIENT_ROLE' = 'Vai trò của bạn không đủ quyền để thực hiện hành động này',
	'RESOURCE_ACCESS_DENIED' = 'Bạn không có quyền truy cập vào tài nguyên này',
	'ALREADY_AUTHENTICATED' = 'Bạn đã đăng nhập rồi',
	'AUTHENTICATION_REQUIRED' = 'Bạn cần đăng nhập để tiếp tục',
	'TOO_MANY_ATTEMPTS' = 'Quá nhiều lần thử, vui lòng thử lại sau',
	'INVALID_2FA_CODE' = 'Mã xác thực hai yếu tố không chính xác',
	'PASSWORD_EXPIRED' = 'Mật khẩu đã hết hạn, vui lòng đổi mật khẩu mới',
	'INVALID_TOKEN_FORMAT' = 'Định dạng token không hợp lệ',
	'SIGNATURE_VERIFICATION_FAILED' = 'Xác minh chữ ký thất bại'
}