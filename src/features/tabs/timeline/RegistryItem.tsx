import { useNavigate } from "react-router-dom";
import "./RegistryItem.css";

import Icon, { getIconByCaseInsensitiveName } from "../../../components/Icons";
import { RegistryWithDetails } from '../../../data/models/Registry';
import AccountsRegistry from "../../../data/models/AccountRegistry";

interface RegistryItemProps {
  item: RegistryWithDetails;
  onCategoryClick?: (categoryId: string) => void;
}

const RegistryItem = ({ item: {registry, category, sourceName}, onCategoryClick }: RegistryItemProps) => {

  const navigate = useNavigate();

  const toSource = () => {
    if (registry instanceof AccountsRegistry) {      
      navigate('/main/timeline/' + registry.accountId);
    }
  };

  return <div key={registry.id} className="TimelineItem" style={{ opacity: registry.paid ? 1 : 0.7 }}>
    {/* Área Esquerda: Círculo com cor da categoria */}
    <div
      onClick={() => category?.id && onCategoryClick?.(category?.id)}
      className="TimelineCategory"
      style={{ backgroundColor: category?.color ?? "#ccc", display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Icon icon={getIconByCaseInsensitiveName(category?.icon ?? "question")} size="1x" color="#fff" />
    </div>

    {/* Área Central: Informações principais */}
    <div className="TimelineContent">
      <div className="TimelineDescription">{registry.description}</div>
      <div className="TimelineDetails">
        <span className="TimelineDate">{registry.date.toLocaleDateString()}</span>
        {registry.categoryId && <div className="TimelineCategoryName" 
          onClick={() => category?.id && onCategoryClick?.(category?.id)}
        >
          {category?.name}
        </div>}
        <span onClick={toSource} className="TimelineBankName">{sourceName}</span>
      </div>
    </div>

    {/* Área Direita: Valor formatado */}
    <div className={`TimelineValue ${registry.value >= 0 ? "positive" : "negative"}`}>
      {registry.formatedPrice}
    </div>
  </div>;
};


export default RegistryItem;