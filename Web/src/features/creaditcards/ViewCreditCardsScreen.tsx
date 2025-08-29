import { useParams } from "react-router-dom";

const ViewCreditCardsScreen = () => {
    const { id } = useParams();

    return <div className="Screen">
        ViewCreditCardsScreen. Id: {id}
    </div>
}

export default ViewCreditCardsScreen;
