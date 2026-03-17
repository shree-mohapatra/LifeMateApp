from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# ⭐ safe model path (important for Render)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "lifemate_model11.pkl")

bundle = joblib.load(model_path)

model = bundle["model"]
le_gender = bundle["le_gender"]
le_activity = bundle["le_activity"]
le_target = bundle["le_target"]
le_bmi = bundle["le_bmi"]

# BMI category (same as training)
def bmi_category(bmi):
    if bmi < 18.5:
        return "underweight"
    elif bmi < 25:
        return "healthy"
    elif bmi < 30:
        return "overweight"
    else:
        return "obese"


#  health check route (Render uses this)
@app.route("/")
def home():
    return "LifeMate ML API running"


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        print("Incoming:", data)

        # normalize
        gender = data["gender"].lower().strip()
        activity = data["activity_level"].lower().strip()

        # encode
        gender_encoded = le_gender.transform([gender])[0]
        activity_encoded = le_activity.transform([activity])[0]

        # bmi category
        bmi = float(data["bmi"])
        bmi_cat = bmi_category(bmi)
        bmi_encoded = le_bmi.transform([bmi_cat])[0]

        # ⭐ correct feature order (same as training)
        features = np.array([[ 
            int(data["age"]),
            float(data["avg_sleep_hours"]),
            float(data["avg_water_intake_liters"]),
            gender_encoded,
            activity_encoded,
            bmi_encoded
        ]])

        pred = model.predict(features)[0]
        exercise = le_target.inverse_transform([pred])[0]

        return jsonify({"exercise": exercise})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500


# ⭐ dynamic port for Render
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
