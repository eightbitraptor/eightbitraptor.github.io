require "rqrcode"
require "pathname"

mecard_data = "MECARD:N:Valentine-House,Matthew;EMAIL:matt@eightbitraptor.com;URL:https://www.eightbitraptor.com;;"
output_path =  Pathname.new(__dir__).join("..").join("src").join("images").realpath

qr = RQRCode::QRCode.new(mecard_data, size: 5, level: 'l')
png = qr.as_png(
  size: 208,
  border_modules: 0,
  border: 0,
  resize_exactly_to: 208
)

IO.binwrite(output_path.join("eightbitraptor-mecard.png"), png.to_s)
