import React, { useEffect, useState } from "react";
import { clientApi, loanApi, pawnshopApi } from "@/api/endpoints";
import type { Loan } from "@/types";

export default function DashboardPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [pawnshopCount, setPawnshopCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loanApi.list(), pawnshopApi.list(), clientApi.list()])
      .then(([l, p, c]) => {
        setLoans(l);
        setPawnshopCount(p.length);
        setClientCount(c.length);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Загрузка...</div>;

  const today = new Date().toISOString().slice(0, 10);
  const open = loans.filter((l) => !l.is_returned);
  const overdue = loans.filter((l) => !l.is_returned && l.return_date && l.return_date < today);
  const totalOutstanding = open.reduce((sum, l) => sum + Number(l.amount), 0);

  return (
    <div>
      <div className="stat-grid">
        <div className="card stat-card">
          <div className="label">Ломбардов в реестре</div>
          <div className="value mono">{pawnshopCount}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Клиентов</div>
          <div className="value mono">{clientCount}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Открытых ссуд</div>
          <div className="value mono">{open.length}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Просроченных ссуд</div>
          <div className="value mono" style={{ color: overdue.length ? "var(--danger-600)" : undefined }}>
            {overdue.length}
          </div>
        </div>
        <div className="card stat-card">
          <div className="label">Сумма невозвращённых ссуд</div>
          <div className="value mono">{totalOutstanding.toLocaleString("ru-RU")} ₽</div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="section-title" style={{ marginTop: 0 }}>Быстрый доступ</div>
        <div className="helper-text">
          Используйте меню слева, чтобы перейти к ссудам, клиентам, ломбардам, справочникам
          или к разделу «Запросы и визуализация» для аналитики по накопленным данным.
        </div>
      </div>
    </div>
  );
}
