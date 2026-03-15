import "./RegistryItem.css";

import { useLocation, useNavigate } from "react-router-dom";
import routes from "../../navigate";

import Icon, { getIconByCaseInsensitiveName } from '@componentsDeprecated/Icons';
import { InvoiceTransaction, AccountsRegistry, RegistryType, RegistryWithDetails, CreditCardRegistry, TransferTransaction } from '@models';

interface RegistryItemProps {
  item: RegistryWithDetails;
  onlyOutcome?: boolean;
  onCategoryClick?: (categoryId: string) => void;
}

const RegistryItem = (
  { item: {registry, category, sourceName}, onCategoryClick, onlyOutcome = false
}: RegistryItemProps) => {

  const navigate = useNavigate();
  const location = useLocation();
  const timelineSearch = location.pathname.startsWith("/timeline") ? location.search : "";

  const toSource = () => {
    if (registry instanceof AccountsRegistry) {      
      navigate(routes.timeline(registry.accountId));
    }
  };

  return <div 
      key={registry.id} className={"TimelineItem" + (registry.paid ? '' : ' not-paid')}
      onClick={() => {
        if (registry instanceof InvoiceTransaction) navigate(routes.timelineInvoice(registry.cardId, registry.name, timelineSearch));
        else if (registry instanceof CreditCardRegistry) navigate(routes.timelineCredit(registry.id, timelineSearch))
        else if (registry instanceof TransferTransaction || registry.type === RegistryType.TRANSFER) navigate(routes.timelineTransfer(registry.id, timelineSearch))
        else navigate(routes.timelineDebit(registry.id, timelineSearch))
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
