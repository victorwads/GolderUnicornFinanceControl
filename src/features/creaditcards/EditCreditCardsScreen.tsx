import { useParams } from "react-router-dom"

const EditCreditCardsScreen = () => {
    let { id } = useParams()

    return <div className="Screen">
        EditCreditCardsScreen. Id: {id}
    </div>
}

export default EditCreditCardsScreen