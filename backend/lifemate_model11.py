import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# load
df = pd.read_csv("fitness_dataset_balanced.csv")

# normalize
df["gender"] = df["gender"].str.lower().str.strip()
df["activity_level"] = df["activity_level"].str.lower().str.strip()
df["recommended_exercise"] = df["recommended_exercise"].str.strip()

# BMI category
def bmi_category(bmi):
    if bmi < 18.5:
        return "underweight"
    elif bmi < 25:
        return "healthy"
    elif bmi < 30:
        return "overweight"
    else:
        return "obese"

df["bmi_category"] = df["bmi"].apply(bmi_category)

#  drop duplicate features
df = df.drop(["height_cm","weight_kg","bmi"], axis=1)

# encoders
le_gender = LabelEncoder()
le_activity = LabelEncoder()
le_target = LabelEncoder()
le_bmi = LabelEncoder()

df["gender"] = le_gender.fit_transform(df["gender"])
df["activity_level"] = le_activity.fit_transform(df["activity_level"])
df["bmi_category"] = le_bmi.fit_transform(df["bmi_category"])
df["recommended_exercise"] = le_target.fit_transform(df["recommended_exercise"])

#  feature order (VERY IMPORTANT)
feature_cols = [
    "age",
    "avg_sleep_hours",
    "avg_water_intake_liters",
    "gender",
    "activity_level",
    "bmi_category"
]

X = df[feature_cols]
y = df["recommended_exercise"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)

pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, pred))

#  save everything
joblib.dump({
    "model": model,
    "le_gender": le_gender,
    "le_activity": le_activity,
    "le_target": le_target,
    "le_bmi": le_bmi,
    "feature_cols": feature_cols
}, "lifemate_model11.pkl")

print("Model saved")

