# Zunit

### Universal Unit Converter

[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/) [![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE) [![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)](#)

**Zunit** is a lightweight, fast, and extensible web-based unit converter built with Python and Flask.

It allows users to convert values between different units across multiple measurement categories through a simple interface.

---

## Features

- Convert values between different units
- Supports **any-to-any conversion** within a measurement category
- Real-time conversion
- Simple and responsive interface
- No database required
- Server-side conversion engine
- Dedicated temperature conversion logic
- Easy to extend with additional units and categories
- JSON API endpoint for conversions
- Clean separation between frontend and backend

---

## Supported Measurements

| Category            | Units                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Length**          | Millimeter, Centimeter, Meter, Kilometer, Inch, Foot, Yard, Mile                                                                        |
| **Weight**          | Milligram, Gram, Kilogram, Ounce, Pound                                                                                                 |
| **Volume**          | Milliliter, Liter, Cubic Meter, Cubic Centimeter, Cubic Inch, Cubic Foot, Gallon, Quart, Pint, Cup                                      |
| **Area**            | Square Millimeter, Square Centimeter, Square Meter, Square Kilometer, Square Inch, Square Foot, Square Yard, Acre, Hectare, Square Mile |
| **Temperature**     | Celsius, Fahrenheit, Kelvin                                                                                                             |
| **Speed**           | Meter/Second, Kilometer/Hour, Mile/Hour, Foot/Second, Knot                                                                              |
| **Time**            | Millisecond, Second, Minute, Hour, Day, Week, Month, Year                                                                               |
| **Digital Storage** | Bit, Byte, Kilobyte, Megabyte, Gigabyte, Terabyte, KiB, MiB, GiB, TiB                                                                   |
| **Pressure**        | Pascal, Kilopascal, Bar, Atmosphere, PSI, Torr                                                                                          |
| **Energy**          | Joule, Kilojoule, Calorie, Kilocalorie, Watt-hour, Kilowatt-hour, Electronvolt                                                          |
| **Power**           | Watt, Kilowatt, Megawatt, Horsepower                                                                                                    |
| **Angle**           | Degree, Radian, Gradian, Arcminute, Arcsecond                                                                                           |

---

## How Conversion Works

Zunit uses a **base-unit conversion system**.

Instead of defining every possible conversion pair individually, each unit is assigned a conversion factor relative to a base unit.

For example, length uses **meter** as its base unit:

```text
Mile
  ↓
Meter
  ↓
Centimeter
```

This means a new unit only needs to define its relationship with the base unit.

The same system allows:

```text
Any Unit
    ↓
Base Unit
    ↓
Any Other Unit
```

This makes the converter scalable without creating hundreds of individual conversion formulas.

### Temperature

Temperature cannot use a simple multiplication factor because the scales have different zero points.

Therefore, temperature follows:

```text
Source
  ↓
Celsius
  ↓
Destination
```

For example:

```text
Fahrenheit → Celsius → Kelvin
```

---

## Tech Stack

### Backend

- Python
- Flask

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript

### Architecture

```text
Browser
   │
   │ JSON request
   ▼
Flask Server
   │
   ▼
Conversion Engine
   │
   ▼
JSON Response
   │
   ▼
Browser
```

No database or external conversion service is required.

---

## Project Structure

```text
Zunit/
│
├── app.py
├── requirements.txt
│
├── templates/
│   └── index.html
│
└── static/
    ├── style.css
    └── script.js
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/zunit.git
```

```bash
cd zunit
```

### 2. Create a virtual environment

Windows:

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

macOS / Linux:

```bash
python3 -m venv venv
```

```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run Zunit

```bash
python app.py
```

The application will start locally.

Open:

```text
http://127.0.0.1:5000
```

---

## API

Zunit also exposes a simple conversion endpoint.

### `POST /convert`

Example request:

```json
{
  "value": 10,
  "category": "length",
  "from_unit": "kilometer",
  "to_unit": "mile"
}
```

Example response:

```json
{
  "success": true,
  "result": 6.213711922373339
}
```

### Units endpoint

```text
GET /units
```

Returns the available units grouped by measurement category.

---

## Adding a New Unit

Adding a new unit is designed to be straightforward.

For standard measurements, add the unit and its factor relative to the category's base unit.

For example:

```python
"length": {
    "base": "meter",
    "units": {
        "meter": 1,
        "kilometer": 1000,
        "mile": 1609.344
    }
}
```

A new unit can then be added:

```python
"centimeter": 0.01
```

No new conversion pair needs to be written.

---

## Adding a New Category

A new measurement category can follow the same architecture:

```python
"force": {
    "base": "newton",
    "units": {
        "newton": 1,
        "kilonewton": 1000,
        "dyne": 0.00001
    }
}
```

The frontend automatically receives the available units through:

```text
GET /units
```

---

## Accuracy

Zunit uses standardized conversion factors for supported units.

Floating-point arithmetic is used internally, so extremely large or extremely small values may display using scientific notation.

For example:

```text
1.602176634e-19
```

This is intentional and prevents excessively long decimal representations.

---

## Design Goals

Zunit is built around a few simple principles:

- **Simple** — conversion should require minimal interaction.
- **Accurate** — use established conversion factors.
- **Extensible** — adding units should not require rewriting the application.
- **Lightweight** — no database or unnecessary dependencies.
- **Readable** — both the interface and codebase should remain easy to understand.

---

## Future Possibilities

Potential additions include:

- More measurement categories
- More imperial and metric units
- Currency conversion
- Custom user-defined units
- Conversion history
- Copy-to-clipboard
- Keyboard shortcuts
- Dark mode
- PWA support
- More extensive API functionality

---

## License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for details.

---

## Author

**Muhammad Hasan Zarif**

---

<p align="center">
  <strong>Zunit</strong><br>
  Universal Unit Converter
</p>
