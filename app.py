from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


UNITS = {
    "Length": {
        "base": "meter",
        "units": {
            "Millimeter": 0.001,
            "Centimeter": 0.01,
            "Meter": 1,
            "Kilometer": 1000,
            "Inch": 0.0254,
            "Foot": 0.3048,
            "Yard": 0.9144,
            "Mile": 1609.344,
        },
    },

    "Weight": {
        "base": "gram",
        "units": {
            "Milligram": 0.001,
            "Gram": 1,
            "Kilogram": 1000,
            "Ounce": 28.349523125,
            "Pound": 453.59237,
        },
    },

    "Volume": {
        "base": "liter",
        "units": {
            "Milliliter": 0.001,
            "Liter": 1,
            "Cubic Meter": 1000,
            "Cubic Centimeter": 0.001,
            "Cubic Inch": 0.016387064,
            "Cubic Foot": 28.316846592,
            "US Gallon": 3.785411784,
            "Quart": 0.946352946,
            "Pint": 0.473176473,
            "Cup": 0.2365882365,
        },
    },

    "Area": {
        "base": "square meter",
        "units": {
            "Square Millimeter": 0.000001,
            "Square Centimeter": 0.0001,
            "Square Meter": 1,
            "Square Kilometer": 1000000,
            "Square Inch": 0.00064516,
            "Square Foot": 0.09290304,
            "Square Yard": 0.83612736,
            "Acre": 4046.8564224,
            "Hectare": 10000,
            "Square Mile": 2589988.110336,
        },
    },

    "Temperature": {
        "base": "celsius",
        "units": {
            "Celsius": None,
            "Fahrenheit": None,
            "Kelvin": None,
        },
    },

    "Speed": {
        "base": "meter per second",
        "units": {
            "Meters per Second": 1,
            "Kilometers per Hour": 0.2777777778,
            "Miles per Hour": 0.44704,
            "Feet per Second": 0.3048,
            "Knot": 0.5144444444,
        },
    },

    "Time": {
        "base": "second",
        "units": {
            "Millisecond": 0.001,
            "Second": 1,
            "Minute": 60,
            "Hour": 3600,
            "Day": 86400,
            "Week": 604800,
            "Month": 2629800,
            "Year": 31557600,
        },
    },

    "Digital Storage": {
        "base": "byte",
        "units": {
            "Bit": 0.125,
            "Byte": 1,
            "Kilobyte": 1000,
            "Megabyte": 1000000,
            "Gigabyte": 1000000000,
            "Terabyte": 1000000000000,
            "Kibibyte": 1024,
            "Mebibyte": 1048576,
            "Gibibyte": 1073741824,
            "Tebibyte": 1099511627776,
        },
    },

    "Pressure": {
        "base": "pascal",
        "units": {
            "Pascal": 1,
            "Kilopascal": 1000,
            "Bar": 100000,
            "Atmosphere": 101325,
            "PSI": 6894.757293168,
            "Torr": 133.3223684211,
        },
    },

    "Energy": {
        "base": "joule",
        "units": {
            "Joule": 1,
            "Kilojoule": 1000,
            "Calorie": 4.184,
            "Kilocalorie": 4184,
            "Watt-hour": 3600,
            "Kilowatt-hour": 3600000,
            "Electronvolt": 1.602176634e-19,
        },
    },

    "Power": {
        "base": "watt",
        "units": {
            "Watt": 1,
            "Kilowatt": 1000,
            "Megawatt": 1000000,
            "Horsepower": 745.6998716,
        },
    },

    "Angle": {
        "base": "degree",
        "units": {
            "Degree": 1,
            "Radian": 57.2957795131,
            "Gradian": 0.9,
            "Arcminute": 1 / 60,
            "Arcsecond": 1 / 3600,
        },
    },
}


def temperature_to_celsius(value, unit):
    if unit == "Celsius":
        return value

    if unit == "Fahrenheit":
        return (value - 32) * 5 / 9

    if unit == "Kelvin":
        return value - 273.15

    raise ValueError("Invalid temperature unit.")


def celsius_to_temperature(value, unit):
    if unit == "Celsius":
        return value

    if unit == "Fahrenheit":
        return (value * 9 / 5) + 32

    if unit == "Kelvin":
        return value + 273.15

    raise ValueError("Invalid temperature unit.")


def convert(value, category, from_unit, to_unit):
    if category not in UNITS:
        raise ValueError("Invalid category.")

    category_data = UNITS[category]

    if from_unit not in category_data["units"]:
        raise ValueError("Invalid source unit.")

    if to_unit not in category_data["units"]:
        raise ValueError("Invalid destination unit.")

    if category == "Temperature":
        celsius = temperature_to_celsius(value, from_unit)
        return celsius_to_temperature(celsius, to_unit)

    base_value = value * category_data["units"][from_unit]
    return base_value / category_data["units"][to_unit]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/units")
def units():
    return jsonify({
        category: list(data["units"].keys())
        for category, data in UNITS.items()
    })


@app.route("/convert", methods=["POST"])
def conversion():
    try:
        data = request.get_json()

        value = float(data["value"])
        category = data["category"]
        from_unit = data["from_unit"]
        to_unit = data["to_unit"]

        result = convert(
            value,
            category,
            from_unit,
            to_unit
        )

        return jsonify({
            "success": True,
            "result": result
        })

    except (ValueError, TypeError, KeyError) as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 400


if __name__ == "__main__":
    app.run(debug=True)