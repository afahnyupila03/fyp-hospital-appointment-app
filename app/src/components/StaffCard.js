import { Icon } from "./Icon";

export const StaffCard = ({
  icon,
  count,
  name,
  cardStyle,
  cardClassName,
  iconStyle,
  iconClassName,
}) => {
  return (
    <div style={cardStyle} className={cardClassName}>
      <div>
        <Icon Icon={icon} style={iconStyle} className={iconClassName} />
      </div>
      <div>
        <h4>{count}</h4>
        <h5>{name}</h5>
      </div>
    </div>
  );
};
