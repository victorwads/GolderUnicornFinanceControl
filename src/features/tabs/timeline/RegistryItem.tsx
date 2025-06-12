import "./RegistryItem.css";

import { useNavigate } from "react-router-dom";
import routes from "../../navigate";

import Icon, { getIconByCaseInsensitiveName } from '@components/Icons';
import { InvoiceRegistry, AccountsRegistry, RegistryType, RegistryWithDetails} from '@models';

interface RegistryItemProps {
  item: RegistryWithDetails;
  onlyOutcome?: boolean;
  onCategoryClick?: (categoryId: string) => void;
}

const RegistryItem = (
  { item: {registry, category, sourceName}, onCategoryClick, onlyOutcome = false
}: RegistryItemProps) => {

  const navigate = useNavigate();

  const toSource = () => {
    if (registry instanceof AccountsRegistry) {      
      navigate(routes.timeline(registry.accountId));
    }
  };

  return <div 
      key={registry.id} className={"TimelineItem" + (registry.paid ? '' : ' not-paid')}
      onClick={() => {
        if(registry instanceof InvoiceRegistry) {
          navigate(routes.invoice(registry.cardId, registry.name));
          return
        };
        navigate(routes.registry(registry.id))
      }}
    >
    {/* Área Esquerda: Círculo com cor da categoria */}
    <div
      onClick={() => category?.id && onCategoryClick?.(category?.id)}
      className="IconBall"
      style={{ backgroundColor: category?.color ?? "#ccc", display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Icon icon={getIconByCaseInsensitiveName(category?.icon ?? "question")} size="1x" color="#fff" />
    </div>

    {/* Área Central: Informações principais */}
    <div className="TimelineContent">
      {registry.type !== RegistryType.TRANSFER && <div className="TimelineDescription">{registry.description}</div>}
      <div className="TimelineDetails">
        <span className="TimelineDate">{registry.date.toLocaleDateString()}</span>
        <span onClick={toSource} className="TimelineBankName">{sourceName}</span>
        {registry.categoryId &&
        <div className="TimelineCategoryName" onClick={() => category?.id && onCategoryClick?.(category?.id)}>
          {category?.name}
        </div>}
      </div>
    </div>

    {/* Área Direita: Valor formatado */}
    <div className={`TimelineValue ${!onlyOutcome && registry.value >= 0 ? "positive" : "negative"}`}>
      {registry.formatedPrice}
    </div>
  </div>;
};


export default RegistryItem;
