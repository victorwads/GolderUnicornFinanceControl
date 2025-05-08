import './SearchBar.css'

interface SearchBarParams {
    value: string
    onSearchEach?: (search: string) => void
}

const SearchBar = (params: SearchBarParams) => {
    return <div className='SearchBar'>
        <input onChange={it => {
            if(params.onSearchEach) params.onSearchEach(it.target.value)
        } } placeholder='Pesquisar' value={params.value} />
        <span></span>
    </div>
}

interface SearchBarScreenParams extends SearchBarParams {
    children: React.ReactNode
}

export const SearchBarScreen = (params: SearchBarScreenParams) => {
    return <div className='SearchBarScreen'>
        <SearchBar {...params}  />
        <div className='content'>
            {params.children}
        </div>
    </div>
}

export default SearchBar
