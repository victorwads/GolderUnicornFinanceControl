import { useParams } from "react-router-dom"

const EditAccountScreen = () => {
    let { id } = useParams()

    return <div className="Screen">
        EditAccountScreen. Id: {id}
    </div>
}

export default EditAccountScreen