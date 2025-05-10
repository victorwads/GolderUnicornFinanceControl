import Icon from '../Icons'
import './SearchBar.css'

interface SearchBarParams {
    value: string
    onSearchEach?: (search: string) => void
    onClose?: () => void
}

const SearchBar = (params: SearchBarParams) => {
    return <div className='SearchBar'>
        <input onChange={it => {
            if(params.onSearchEach) params.onSearchEach(it.target.value)
        } } placeholder='Pesquisar' value={params.value} />
        <button className="modal-back-button" onClick={params.onClose}>
          <Icon icon={Icon.all.faClose} />
        </button>
    </div>
}

export default SearchBar
