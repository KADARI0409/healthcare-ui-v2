import React from "react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  cardClass?: string;
  titleClass?: string;
  valueClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  cardClass = "",
  titleClass = "text-white-50",
  valueClass = "mb-0 text-white",
}) => {
  return (
    <div className="col-md-3 mb-3">
      <div className={`card border-0 shadow-sm rounded-4 ${cardClass}`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className={`${titleClass} mb-1`}>{title}</h6>
              <h2 className={valueClass}>{value}</h2>
            </div>
            <div className="display-4 opacity-50 text-white">{icon}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
