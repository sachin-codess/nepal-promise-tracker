import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useT } from "../lib/i18n";

const EMPTY = {
  politician_name: "",
  promise: "",
  category: "",
  province: "Federal",
  date_made: "",
  deadline: "",
  source_url: "",
  notes: "",
};

const PROVINCES = [
  "Federal", "Koshi", "Madhesh", "Bagmati",
  "Gandaki", "Lumbini", "Karnali", "Sudurpashchim",
];

export default function SubmitModal({ open, onClose }) {
  const t = useT();
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState("idle"); // idle | sending | ok | error
  const [err, setErr] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (open) { setForm(EMPTY); setState("idle"); setErr(""); }
  }, [open]);

  if (!open) return null;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const valid =
    form.politician_name.trim() &&
    form.promise.trim() &&
    form.source_url.trim();

  const send = async () => {
    if (!form.source_url.trim()) { setErr(t("submitNeedSource")); return; }
    setState("sending");
    setErr("");
    const row = {
      ...form,
      date_made: form.date_made || null,
      deadline: form.deadline || null,
      category: form.category.trim() || null,
      notes: form.notes.trim() || null,
    };
    const { error } = await supabase.from("submissions").insert([row]);
    if (error) { setState("error"); setErr(t("submitErr")); return; }
    setState("ok");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal sub-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label={t("close")}>×</button>
        <h2 className="tl-title">{t("submitTitle")}</h2>

        {state === "ok" ? (
          <div className="sub-done">
            <p className="sub-ok">{t("submitOk")}</p>
            <button
              className="sub-send"
              onClick={() => { setForm(EMPTY); setState("idle"); }}
            >
              {t("submitAnother")}
            </button>
          </div>
        ) : (
          <>
            <p className="tl-sub">{t("submitLead")}</p>

            <div className="sub-grid">
              <label className="sub-field">
                <span>{t("fPolitician")} <em>{t("fRequired")}</em></span>
                <input value={form.politician_name} onChange={set("politician_name")} />
              </label>

              <label className="sub-field sub-wide">
                <span>{t("fPromise")} <em>{t("fRequired")}</em></span>
                <textarea rows={3} value={form.promise} onChange={set("promise")} />
              </label>

              <label className="sub-field sub-wide">
                <span>{t("fSource")} <em>{t("fRequired")}</em></span>
                <input
                  type="url"
                  placeholder="https://"
                  value={form.source_url}
                  onChange={set("source_url")}
                />
              </label>

              <label className="sub-field">
                <span>{t("fCategory")} <em>{t("fOptional")}</em></span>
                <input value={form.category} onChange={set("category")} />
              </label>

              <label className="sub-field">
                <span>{t("fProvince")} <em>{t("fOptional")}</em></span>
                <select value={form.province} onChange={set("province")}>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>

              <label className="sub-field">
                <span>{t("fDateMade")} <em>{t("fOptional")}</em></span>
                <input type="date" value={form.date_made} onChange={set("date_made")} />
              </label>

              <label className="sub-field">
                <span>{t("fDeadline")} <em>{t("fOptional")}</em></span>
                <input type="date" value={form.deadline} onChange={set("deadline")} />
              </label>

              <label className="sub-field sub-wide">
                <span>{t("fNotes")} <em>{t("fOptional")}</em></span>
                <textarea rows={2} value={form.notes} onChange={set("notes")} />
              </label>
            </div>

            {err && <p className="sub-err">{err}</p>}

            <button
              className="sub-send"
              disabled={!valid || state === "sending"}
              onClick={send}
            >
              {state === "sending" ? t("submitSending") : t("submitSend")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
