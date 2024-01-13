import { useParams } from "react-router-dom"

const ViewCreditCardsScreen = () => {
    let { id } = useParams()

    return <div className="Screen">
        ViewCreditCardsScreen. Id: {id}
    </div>
}

export default ViewCreditCardsScreen