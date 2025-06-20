import { Router } from "express";
import Joi from "joi";

const router = Router();

/* ------------------ Joi Validation Schema ------------------ */
const schema = Joi.object({
  emp_no: Joi.number().integer().required(),
  birth_date: Joi.date().required(),
  first_name: Joi.string().max(14).required(),
  last_name: Joi.string().max(16).required(),
  gender: Joi.string().valid("M", "F").required(),
  hire_date: Joi.date().required(),
});

/* -------------------- CRUD End-Points -------------------- */

// GET /api/employees  (أول 10 موظفين)
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await req.pool.query("SELECT * FROM employees LIMIT 10");
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/employees/:id
router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await req.pool.query(
      "SELECT * FROM employees WHERE emp_no = ?", [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Employee not found" });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// POST /api/employees
router.post("/", async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    const sql = `
      INSERT INTO employees
        (emp_no, birth_date, first_name, last_name, gender, hire_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await req.pool.query(sql, [
      req.body.emp_no,
      req.body.birth_date,
      req.body.first_name,
      req.body.last_name,
      req.body.gender,
      req.body.hire_date,
    ]);
    res.status(201).json({ message: "Created" });
  } catch (e) { next(e); }
});

// PUT /api/employees/:id
router.put("/:id", async (req, res, next) => {
  try {
    await schema.validateAsync({ ...req.body, emp_no: req.params.id }, { abortEarly: false });
    const sql = `
      UPDATE employees
      SET birth_date=?, first_name=?, last_name=?, gender=?, hire_date=?
      WHERE emp_no=?
    `;
    const [{ affectedRows }] = await req.pool.query(sql, [
      req.body.birth_date,
      req.body.first_name,
      req.body.last_name,
      req.body.gender,
      req.body.hire_date,
      req.params.id,
    ]);
    if (!affectedRows) return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Updated" });
  } catch (e) { next(e); }
});

// DELETE /api/employees/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const [{ affectedRows }] = await req.pool.query(
      "DELETE FROM employees WHERE emp_no = ?", [req.params.id]
    );
    if (!affectedRows) return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
});

export default router;
