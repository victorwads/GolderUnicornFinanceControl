import { useParams } from "react-router-dom"

const ViewAccountScreen = () => {
    let { id } = useParams()

    return <div className="Screen">
        ViewAccountScreen. Id: {id}
    </div>
}

export default ViewAccountScreen