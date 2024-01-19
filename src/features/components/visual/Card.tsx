import './Card.css'

interface CardParams {
    children: React.ReactNode
}

const Card = (params: CardParams) => <div className="Card">
    {params.children}
</div>

export default Card