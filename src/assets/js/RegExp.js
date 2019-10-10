/* 正则校验函数 */
function on_handphone(val) {
  return /(?:^1[3456789]|^9[28])\d{9}$/.test(val)
}

function on_QQ(val) {
  return /^[1-9]\d{4,9}$/.test(val)
}

function on_email(val) {
  return /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(val)
}

function on_telephone(val) {
  return /^0\d{2,3}-\d{7,8}$/.test(val)
}

function on_zip_code(val) {
  return /^[0-9]{6}$/.test(val)
}

function on_tax_number(val) {
  let regExp = /^[A-Z0-9]{15}$|^[A-Z0-9]{17}$|^[A-Z0-9]{18}$|^[A-Z0-9]{20}$/
  return regExp.test(val)
}

function on_amount(val) {
  let reg = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
  if (!reg.test(val) || val.toString().split('.')[0].length > 18 || !val) {
    return false
  }
  return true
}

export default {
  on_handphone,
  on_QQ,
  on_email,
  on_telephone,
  on_zip_code,
  on_tax_number,
  on_amount
}