type ReadinessGaugeProps = {
  score: number;
};

export const ReadinessGauge = ({score}: ReadinessGaugeProps) => {
  return (
    <svg 
      fill="none"
      strokeWidth="14"
      strokeLinecap="round"
      viewBox="0 0 200 110">

      <path 
        d="M 20 100 A 80 80 0 0 1 180 100" 
        fill="none"
        strokeWidth="14"
        strokeLinecap="round"
        stroke="white"/>
      
      <path 
        d="M 20 100 A 80 80 0 0 1 180 100" 
        fill="none"
        strokeWidth="14"
        strokeLinecap="round"
        stroke="lightblue"
        pathLength="100"
        strokeDasharray={score + " 100"}/>    

      <text
        x="100"
        y="85"
        textAnchor="middle"
        fill="currentColor"
        fontSize="30"
        fontWeight="600"
      >
        {score}
      </text>
      </svg>
  );
};