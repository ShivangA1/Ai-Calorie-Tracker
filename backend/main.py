from fastapi import FastAPI
import requests
import json
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
from models import Base, Meal, WeightLog


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {"message": "Backend running"}


@app.get("/analyze")
def analyze(food: str):

    prompt = f"""
    Analyze this meal:
    {food}

    Return ONLY valid JSON:

    {{
        "food": "meal name",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number
    }}
    """

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    data = response.json()

    ai_response = data["response"].strip()

    try:

        start = ai_response.find("{")
        end = ai_response.rfind("}") + 1

        clean_json = ai_response[start:end]

        parsed = json.loads(clean_json)

        db = SessionLocal()

        meal = Meal(
            food=parsed["food"],
            calories=parsed["calories"],
            protein=parsed["protein"],
            carbs=parsed["carbs"],
            fat=parsed["fat"],
        )

        db.add(meal)
        db.commit()

        return parsed

    except Exception as e:

        return {
            "error": str(e),
            "raw_response": ai_response
        }


@app.get("/meals")
def get_meals():

    db = SessionLocal()

    meals = db.query(Meal).all()

    return meals


@app.delete("/meals/{meal_id}")
def delete_meal(meal_id: int):

    db = SessionLocal()

    meal = db.query(Meal).filter(Meal.id == meal_id).first()

    if meal:

        db.delete(meal)
        db.commit()

        return {"message": "Meal deleted"}

    return {"error": "Meal not found"}


@app.delete("/meals")
def clear_meals():

    db = SessionLocal()

    db.query(Meal).delete()

    db.commit()

    return {"message": "All meals deleted"}
@app.post("/weight")
def add_weight(weight: float):

    db = SessionLocal()

    log = WeightLog(weight=weight)

    db.add(log)
    db.commit()

    return {
        "message": "Weight added",
        "weight": weight
    }


@app.get("/weight")
def get_weights():

    db = SessionLocal()

    logs = db.query(WeightLog).all()

    return logs
@app.delete("/weight")
def clear_weight_history():
    db = SessionLocal()
    db.query(WeightLog).delete()
    db.commit()
    return {"message": "Weight history cleared"}