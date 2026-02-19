import './styles.scss'
import esnSwedenLogo from './esn-sweden.png'
import 'bootstrap';
import { countMembers } from './members.ts'


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div class="container py-5">
  <img src="${esnSwedenLogo}" class="d-block mx-auto img-fluid pb-4" style="max-width: 160px;" alt="ESN Sweden logo">

  <h1>Membership Statistics</h1>


  <div id="membersContent"></div>

  <p class="text-muted small mt-4 text-center">
    All processing is done in the browser. No data is sent to ESN Sweden.
  </p>
</div>
`

countMembers(document.querySelector<HTMLDivElement>('#membersContent')!)
