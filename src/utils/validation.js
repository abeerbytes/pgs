// Normalises a Pakistani mobile number to 03XXXXXXXXX. Returns '' when invalid.
export function normalizePkPhone(input) {
  let d = String(input || '').replace(/[^\d]/g, '');
  if (d.startsWith('0092')) d = '0' + d.slice(4);
  else if (d.startsWith('92') && d.length === 12) d = '0' + d.slice(2);
  else if (d.length === 10 && d.startsWith('3')) d = '0' + d;
  return /^03\d{9}$/.test(d) ? d : '';
}

export function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());
}

export function validateCheckout(form, { supportedCities = [] } = {}) {
  const e = {};
  const name = form.name.trim();
  if (name.length < 2) e.name = 'Enter your full name.';
  else if (name.length > 80) e.name = 'Name is too long.';

  if (!form.phone.trim()) e.phone = 'Enter your phone number.';
  else if (!normalizePkPhone(form.phone)) e.phone = 'Enter a valid Pakistani mobile number, e.g. 0300 1234567.';

  if (form.email.trim() && !isValidEmail(form.email)) e.email = 'Enter a valid email address or leave it empty.';

  if (!form.city.trim()) e.city = 'Select your city.';
  else if (
    supportedCities.length &&
    !supportedCities.some((c) => c.toLowerCase() === form.city.trim().toLowerCase())
  ) {
    e.city = 'We do not deliver to this city yet.';
  }

  if (form.area.trim().length < 2) e.area = 'Enter your area or neighbourhood.';
  if (form.address.trim().length < 8) e.address = 'Enter your complete delivery address (house, street, landmark).';
  else if (form.address.trim().length > 300) e.address = 'Address is too long (300 characters max).';
  if (form.notes.length > 500) e.notes = 'Notes are too long (500 characters max).';
  return e;
}
