import { defineAsyncComponent, type AsyncComponentLoader, type Component } from 'vue'
import AsyncPanelStatus from '../components/AsyncPanelStatus.vue'

export function asyncPanel<T extends Component>(loader: AsyncComponentLoader<T>): T {
    return defineAsyncComponent({
        loader,
        loadingComponent: AsyncPanelStatus,
        errorComponent: AsyncPanelStatus,
        delay: 150,
        timeout: 20000,
        onError(_error, retry, fail, attempts) {
            if (attempts < 2) retry()
            else fail()
        }
    })
}
