import { withRepos } from '@components/WithRepo'
import AssistantPage from './AssistantPage'

const AssistantAIMicrophone = () => {
    return withRepos(
        <AssistantPage compact />
    )
}

export default AssistantAIMicrophone
