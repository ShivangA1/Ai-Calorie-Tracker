"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#0f0f0f",
        border: "1px solid #2a2a2a",
        borderRadius: "8px",
        padding: "10px 14px",
        color: "#a3e635",
        fontFamily: "'DM Mono', monospace",
        fontSize: "13px",
      }}>
        <p style={{ color: "#666", marginBottom: 4 }}>#{label}</p>
        <p style={{ color: "#a3e635", fontWeight: 700 }}>{payload[0].value}{payload[0].dataKey === "weight" ? " kg" : " kcal"}</p>
      </div>
    );
  }
  return null;
};

export default function Home() {
  const [food, setFood] = useState("");
  const [result, setResult] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState("");
  const [weights, setWeights] = useState<any[]>([]);

  const calorieGoal = 2200;
  const proteinGoal = 140;

  const fetchMeals = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/meals");
      setMeals(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchWeights = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/weight");
      setWeights(response.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchMeals(); fetchWeights(); }, []);

  const analyzeFood = async () => {
    if (!food) return;
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/analyze", { params: { food } });
      setResult(response.data);
      fetchMeals();
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const addWeight = async () => {
    if (!weight) return;
    try {
      await axios.post(`http://127.0.0.1:8000/weight?weight=${weight}`);
      setWeight("");
      fetchWeights();
    } catch (error) { console.error(error); }
  };

  const deleteMeal = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/meals/${id}`);
      fetchMeals();
    } catch (error) { console.error(error); }
  };

  const clearHistory = async () => {
    try {
      await axios.delete("http://127.0.0.1:8000/meals");
      fetchMeals();
    } catch (error) { console.error(error); }
  };

  const clearWeightHistory = async () => {
    try {
      await axios.delete("http://127.0.0.1:8000/weight");
      fetchWeights();
    } catch (error) { console.error(error); }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;
  const weightChartData = weights.map((item, index) => ({ day: index + 1, weight: item.weight }));
  const calorieChartData = meals.map((meal, index) => ({ meal: index + 1, calories: meal.calories }));

  const caloriePercent = Math.min((totalCalories / calorieGoal) * 100, 100);
  const proteinPercent = Math.min((totalProtein / proteinGoal) * 100, 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #080808;
          color: #e8e8e8;
          font-family: 'DM Mono', monospace;
          min-height: 100vh;
        }

        .app {
          max-width: 900px;
          margin: 0 auto;
          padding: 48px 24px;
        }

        /* HEADER */
        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 48px;
          border-bottom: 1px solid #1e1e1e;
          padding-bottom: 32px;
        }

        .header-left .label {
          font-size: 11px;
          letter-spacing: 3px;
          color: #a3e635;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .header-left h1 {
          font-family: 'Syne', sans-serif;
          font-size: 42px;
          font-weight: 800;
          line-height: 1;
          color: #f0f0f0;
          letter-spacing: -1px;
        }

        .header-left h1 span { color: #a3e635; }

        .btn-danger {
          background: transparent;
          border: 1px solid #2a1a1a;
          color: #ff4444;
          padding: 10px 18px;
          border-radius: 8px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .btn-danger:hover { background: #ff444410; border-color: #ff4444; }

        /* ANALYZE BAR */
        .analyze-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 36px;
        }

        .input-field {
          flex: 1;
          background: #111;
          border: 1px solid #222;
          border-radius: 10px;
          padding: 14px 18px;
          color: #e8e8e8;
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field::placeholder { color: #444; }
        .input-field:focus { border-color: #a3e635; }

        .btn-primary {
          background: #a3e635;
          color: #080808;
          border: none;
          border-radius: 10px;
          padding: 14px 28px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          letter-spacing: 0.5px;
        }
        .btn-primary:hover { background: #bef264; transform: translateY(-1px); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* STATS GRID */
        .stats-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .card {
          background: #0f0f0f;
          border: 1px solid #1c1c1c;
          border-radius: 14px;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #a3e635, transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .card:hover::before { opacity: 1; }

        .card-label {
          font-size: 10px;
          letter-spacing: 2.5px;
          color: #555;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .card-big-num {
          font-family: 'Syne', sans-serif;
          font-size: 52px;
          font-weight: 800;
          color: #a3e635;
          line-height: 1;
          letter-spacing: -2px;
        }

        .card-big-unit {
          font-size: 14px;
          color: #555;
          margin-top: 6px;
          letter-spacing: 1px;
        }

        .card-mid-num {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #e8e8e8;
          letter-spacing: -1px;
        }

        .card-sub {
          font-size: 11px;
          color: #555;
          margin-top: 4px;
        }

        /* PROGRESS BAR */
        .progress-wrap {
          margin-top: 14px;
        }
        .progress-bar-bg {
          background: #1a1a1a;
          border-radius: 100px;
          height: 5px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: #a3e635;
          border-radius: 100px;
          transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .progress-bar-fill.warning { background: #facc15; }
        .progress-bar-fill.danger { background: #f87171; }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          font-size: 11px;
          color: #444;
        }
        .progress-labels span:first-child { color: #a3e635; }

        /* TWO COLUMN */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }

        /* CHART CARD */
        .chart-card {
          background: #0f0f0f;
          border: 1px solid #1c1c1c;
          border-radius: 14px;
          padding: 28px;
          margin-bottom: 24px;
        }

        .chart-header {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 24px;
        }

        .chart-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #e8e8e8;
        }

        .chart-subtitle { font-size: 11px; color: #444; letter-spacing: 1px; }

        .chart-wrap { height: 200px; }

        /* WEIGHT INPUT ROW */
        .weight-row { display: flex; gap: 12px; margin-bottom: 20px; }

        .weight-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #131f06;
          border: 1px solid #2a3a10;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 13px;
          color: #a3e635;
        }

        .weight-badge .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #a3e635;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* LATEST MEAL */
        .latest-meal-card {
          background: #0d1a00;
          border: 1px solid #1f3300;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .latest-meal-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .latest-meal-badge {
          background: #a3e635;
          color: #080808;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .latest-meal-name {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #e8e8e8;
          margin-bottom: 14px;
        }

        .macro-chips { display: flex; flex-wrap: wrap; gap: 10px; }

        .macro-chip {
          background: #111;
          border: 1px solid #222;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 12px;
        }

        .macro-chip .mc-label { color: #555; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .macro-chip .mc-value { color: #e8e8e8; font-size: 16px; font-family: 'Syne', sans-serif; font-weight: 700; }
        .macro-chip .mc-value.green { color: #a3e635; }

        /* MEAL HISTORY */
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #e8e8e8;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-title .count {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #555;
          background: #141414;
          border: 1px solid #222;
          padding: 3px 10px;
          border-radius: 100px;
        }

        .meal-list { display: flex; flex-direction: column; gap: 10px; }

        .meal-item {
          background: #0f0f0f;
          border: 1px solid #1c1c1c;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: border-color 0.2s;
        }

        .meal-item:hover { border-color: #2a2a2a; }

        .meal-item-name {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #e8e8e8;
          margin-bottom: 6px;
        }

        .meal-item-meta { display: flex; gap: 16px; }

        .meal-meta-chip {
          font-size: 11px;
          color: #555;
          letter-spacing: 0.5px;
        }

        .meal-meta-chip strong { color: #888; }

        .btn-delete {
          background: transparent;
          border: 1px solid #1a1a1a;
          color: #555;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .btn-delete:hover { border-color: #ff4444; color: #ff4444; background: #ff444408; }

        .btn-clear-weight {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid #2a2010;
          color: #92400e;
          padding: 5px 12px;
          border-radius: 6px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .btn-clear-weight:hover {
          background: #fbbf2410;
          border-color: #fbbf24;
          color: #fbbf24;
        }
        .btn-clear-weight svg {
          width: 12px;
          height: 12px;
          stroke: currentColor;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
        }

        .empty-state {
          text-align: center;
          padding: 48px;
          color: #333;
          font-size: 13px;
          letter-spacing: 1px;
          border: 1px dashed #1e1e1e;
          border-radius: 14px;
        }

        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .stats-grid > .card:first-child { grid-column: span 2; }
          .two-col { grid-template-columns: 1fr; }
          .header-left h1 { font-size: 30px; }
          .card-big-num { font-size: 40px; }
        }
      `}</style>

      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <p className="label">AI-Powered Nutrition</p>
            <h1>Calorie<span>.</span>AI</h1>
          </div>
          <button className="btn-danger" onClick={clearHistory}>Clear History</button>
        </div>

        {/* Analyze Bar */}
        <div className="analyze-bar">
          <input
            type="text"
            className="input-field"
            placeholder="e.g. 2 eggs and a bowl of oats..."
            value={food}
            onChange={(e) => setFood(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeFood()}
          />
          <button className="btn-primary" onClick={analyzeFood} disabled={loading}>
            {loading ? "Analyzing..." : "→ Analyze"}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="card">
            <p className="card-label">Today's Calories</p>
            <p className="card-big-num">{totalCalories.toLocaleString()}</p>
            <p className="card-big-unit">kcal consumed</p>
            <div className="progress-wrap">
              <div className="progress-bar-bg">
                <div
                  className={`progress-bar-fill${caloriePercent > 90 ? " danger" : caloriePercent > 70 ? " warning" : ""}`}
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
              <div className="progress-labels">
                <span>{Math.round(caloriePercent)}%</span>
                <span>Goal: {calorieGoal.toLocaleString()} kcal</span>
              </div>
            </div>
          </div>

          <div className="card">
            <p className="card-label">Protein</p>
            <p className="card-mid-num">{totalProtein}<span style={{ fontSize: 14, color: "#555", marginLeft: 4 }}>g</span></p>
            <p className="card-sub">of {proteinGoal}g goal</p>
            <div className="progress-wrap">
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${proteinPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="card">
            <p className="card-label">Body Weight</p>
            {latestWeight ? (
              <>
                <p className="card-mid-num">{latestWeight}<span style={{ fontSize: 14, color: "#555", marginLeft: 4 }}>kg</span></p>
                <p className="card-sub">latest entry</p>
              </>
            ) : (
              <p style={{ color: "#333", fontSize: 13, marginTop: 12 }}>No data yet</p>
            )}
          </div>
        </div>

        {/* Latest Meal Result */}
        {result && (
          <div className="latest-meal-card">
            <div className="latest-meal-header">
              <span className="latest-meal-badge">Just Added</span>
            </div>
            <p className="latest-meal-name">{result.food}</p>
            <div className="macro-chips">
              <div className="macro-chip">
                <div className="mc-label">Calories</div>
                <div className="mc-value green">{result.calories}</div>
              </div>
              <div className="macro-chip">
                <div className="mc-label">Protein</div>
                <div className="mc-value">{result.protein}g</div>
              </div>
              <div className="macro-chip">
                <div className="mc-label">Carbs</div>
                <div className="mc-value">{result.carbs}g</div>
              </div>
              <div className="macro-chip">
                <div className="mc-label">Fat</div>
                <div className="mc-value">{result.fat}g</div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="two-col">
          <div className="chart-card" style={{ margin: 0 }}>
            <div className="chart-header">
              <span className="chart-title">Calorie Trend</span>
              <span className="chart-subtitle">per meal</span>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calorieChartData}>
                  <CartesianGrid stroke="#161616" vertical={false} />
                  <XAxis dataKey="meal" tick={{ fill: "#444", fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#444", fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="calories" stroke="#a3e635" strokeWidth={2} dot={{ fill: "#a3e635", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#a3e635" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card" style={{ margin: 0 }}>
            <div className="chart-header" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <span className="chart-title">Weight Log</span>
                <span className="chart-subtitle">in kg</span>
              </div>
              {weights.length > 0 && (
                <button className="btn-clear-weight" onClick={clearWeightHistory}>
                  <svg viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                  Reset
                </button>
              )}
            </div>
            <div className="weight-row">
              <input
                type="number"
                className="input-field"
                placeholder="Enter weight..."
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWeight()}
                style={{ padding: "10px 14px", fontSize: 13 }}
              />
              <button className="btn-primary" onClick={addWeight} style={{ padding: "10px 16px", fontSize: 13 }}>
                + Log
              </button>
            </div>
            <div className="chart-wrap" style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData}>
                  <CartesianGrid stroke="#161616" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#444", fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#444", fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="weight" stroke="#a3e635" strokeWidth={2} dot={{ fill: "#a3e635", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#a3e635" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Meal History */}
        <div>
          <p className="section-title">
            Meal History
            <span className="count">{meals.length} entries</span>
          </p>

          {meals.length === 0 ? (
            <div className="empty-state">NO MEALS LOGGED YET</div>
          ) : (
            <div className="meal-list">
              {meals.map((meal) => (
                <div key={meal.id} className="meal-item">
                  <div>
                    <p className="meal-item-name">{meal.food}</p>
                    <div className="meal-item-meta">
                      <span className="meal-meta-chip"><strong>{meal.calories}</strong> kcal</span>
                      <span className="meal-meta-chip"><strong>{meal.protein}g</strong> protein</span>
                      {meal.carbs != null && <span className="meal-meta-chip"><strong>{meal.carbs}g</strong> carbs</span>}
                      {meal.fat != null && <span className="meal-meta-chip"><strong>{meal.fat}g</strong> fat</span>}
                    </div>
                  </div>
                  <button className="btn-delete" onClick={() => deleteMeal(meal.id)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}