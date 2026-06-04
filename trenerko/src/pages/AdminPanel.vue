<template>
  <q-page class="q-pa-md">

    <!-- ZAGLAVLJE -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="bg-red-6 text-white">
        <div class="text-h6">Admin panel</div>
      </q-card-section>
    </q-card>

    <!-- NAVIGACIJSKI TABOVI -->
    <q-tabs
      v-model="tab"
      dense
      class="text-grey q-mb-md"
      active-color="red"
      indicator-color="red"
      align="left"
    >
      <q-tab name="dashboard" icon="dashboard" label="Dashboard" />
      <q-tab name="korisnici" icon="people" label="Korisnici" />
      <q-tab name="sportovi" icon="sports" label="Sportovi" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>

      <!-- ==================== DASHBOARD ==================== -->
      <q-tab-panel name="dashboard">

        <!-- STATISTIKE – 4 kartice s brojevima (korisnici, objekti, događaji, recenzije) -->
        <div class="row q-col-gutter-sm q-mb-lg">
          <div v-for="s in stats" :key="s.label" class="col-6 col-sm-3">
            <q-card flat bordered class="text-center q-pa-md" :class="s.bg">
              <div class="text-caption text-grey-8">{{ s.label }}</div>
              <div class="text-h5 text-weight-bold">{{ s.value }}</div>
            </q-card>
          </div>
        </div>

        <!-- OBJEKTI NA ČEKANJU – prikaz i odobrenje/odbijanje -->
        <div class="text-subtitle1 q-mb-sm">Objekti na čekanju odobrenja:</div>

        <!-- Spinner dok se podaci učitavaju -->
        <div v-if="loadingDashboard" class="text-center q-pa-lg">
          <q-spinner color="red" size="2em" />
        </div>

        <!-- Poruka ako nema objekata na čekanju -->
        <div v-else-if="objektiNaCekanju.length === 0" class="text-grey text-center q-pa-md">
          Nema objekata na čekanju.
        </div>

        <!-- Kartica za svaki objekt na čekanju -->
        <q-card
          v-for="obj in objektiNaCekanju"
          :key="obj.id"
          flat
          bordered
          class="q-mb-sm bg-yellow-1"
        >
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">{{ obj.NazivObjekta }}</div>
              <div class="text-grey-7 text-caption">
                Vlasnik: {{ obj.VlasnikIme }} | Prijavljeno: {{ formatDate(obj.DatumUnosa) }}
              </div>
              <div class="text-grey-6 text-caption">{{ obj.Adresa }}</div>
            </div>
            <!-- Gumbi za odobrenje ili odbijanje objekta -->
            <div class="row q-gutter-xs">
              <q-btn
                unelevated
                color="green"
                label="Odobri"
                size="sm"
                @click="odobriObjekt(obj.id)"
              />
              <q-btn
                unelevated
                color="red"
                label="Odbij"
                size="sm"
                @click="odbijObjekt(obj.id)"
              />
            </div>
          </q-card-section>
        </q-card>

      </q-tab-panel>

      <!-- ==================== KORISNICI ==================== -->
      <q-tab-panel name="korisnici">

        <!-- FILTERI – pretraga po imenu/emailu i filtriranje po ulozi -->
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="searchKorisnik"
              dense
              outlined
              clearable
              placeholder="Pretraži korisnike..."
              prepend-icon="search"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-select
              v-model="filterUloga"
              :options="['Sve', 'Korisnik', 'Vlasnik objekta', 'Admin']"
              dense
              outlined
              label="Uloga"
            />
          </div>
        </div>

        <!-- TABLICA KORISNIKA – s akcijama blokiranja i brisanja -->
        <q-table
          :rows="filtrianiKorisnici"
          :columns="columns"
          row-key="KorisnikID"
          :loading="loadingKorisnici"
          flat
          bordered
        >
          <!-- Prilagođeni slot za stupac akcija -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <!-- Blokiraj/Aktiviraj – skriveno za admina -->
              <q-btn
                v-if="props.row.Uloga !== 'Admin'"
                flat
                dense
                size="sm"
                :color="props.row.status_racuna === 'Blokiran' ? 'green' : 'orange'"
                :label="props.row.status_racuna === 'Blokiran' ? 'Aktiviraj' : 'Blokiraj'"
                @click="toggleBlokiranje(props.row)"
                class="q-mr-xs"
              />
              <!-- Briši korisnika – skriveno za admina -->
              <q-btn
                v-if="props.row.Uloga !== 'Admin'"
                flat
                dense
                size="sm"
                color="negative"
                label="Briši"
                @click="deleteUser(props.row.KorisnikID)"
              />
            </q-td>
          </template>
        </q-table>

      </q-tab-panel>

      <!-- ==================== SPORTOVI ==================== -->
      <q-tab-panel name="sportovi">

        <!-- FORMA ZA DODAVANJE NOVOG SPORTA -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 q-mb-sm">Dodaj novi sport:</div>
            <div class="row q-gutter-sm items-center">
              <q-input
                v-model="noviSport"
                outlined
                dense
                placeholder="Naziv novog sporta"
                style="min-width: 250px;"
                @keyup.enter="dodajSport"
              />
              <q-btn
                unelevated
                color="green"
                label="+ Dodaj sport"
                @click="dodajSport"
                :loading="dodajeSport"
              />
            </div>
            <!-- Povratna poruka (uspjeh ili greška) -->
            <div v-if="sportPoruka" class="q-mt-sm" :class="sportGreska ? 'text-red' : 'text-green'">
              {{ sportPoruka }}
            </div>
          </q-card-section>
        </q-card>

        <!-- LISTA SVIH SPORTOVA – chipovi s mogućnošću brisanja -->
        <div v-if="loadingSportovi" class="text-center q-pa-lg">
          <q-spinner color="green" size="2em" />
        </div>

        <q-card flat bordered v-else>
          <q-card-section>
            <div class="text-subtitle1 q-mb-sm">
              Dostupni sportovi u sustavu:
              <q-badge color="green" :label="sportovi.length" class="q-ml-sm" />
            </div>

            <!-- Svaki sport prikazan kao chip, klik na X briše sport -->
            <div class="row q-col-gutter-xs">
              <div
                v-for="sport in sportovi"
                :key="sport.SportID"
                class="col-auto"
              >
                <q-chip
                  removable
                  color="green-2"
                  text-color="green-9"
                  @remove="obrisiSport(sport.SportID)"
                >
                  {{ sport.NazivSporta }}
                </q-chip>
              </div>
            </div>

            <div v-if="sportovi.length === 0" class="text-grey text-center q-pa-md">
              Nema sportova u katalogu.
            </div>
          </q-card-section>
        </q-card>

      </q-tab-panel>

    </q-tab-panels>

  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

// Bazna URL adresa API-ja
const API = 'http://localhost:3000'

export default {
  name: 'AdminPanel',
  setup() {
    // Aktivni tab (dashboard / korisnici / sportovi)
    const tab = ref('dashboard')

    // ─── DASHBOARD ───────────────────────────────────────────
    const loadingDashboard = ref(true)

    // Sirovi podaci dohvaćeni s API-ja
    const sviKorisnici = ref([])
    const sviObjekti = ref([])
    const sviDogadaji = ref([])
    const sveRecenzije = ref([])

    // Filtrirani objekti čiji status još nije riješen
    const objektiNaCekanju = computed(() =>
      sviObjekti.value.filter(o => o.Status === 'Na čekanju')
    )

    // Podaci za 4 statistike kartice
    const stats = computed(() => [
      { label: 'Korisnici',  value: sviKorisnici.value.length,  bg: 'bg-red-1' },
      { label: 'Objekti',    value: sviObjekti.value.length,    bg: 'bg-blue-1' },
      { label: 'Događaji',   value: sviDogadaji.value.length,   bg: 'bg-green-1' },
      { label: 'Recenzije',  value: sveRecenzije.value.length,  bg: 'bg-orange-1' }
    ])

    // ─── KORISNICI ────────────────────────────────────────────
    const loadingKorisnici = ref(false)
    const searchKorisnik = ref('')   // tekst za pretragu
    const filterUloga = ref('Sve')   // odabrana uloga za filter

    // Definicija stupaca tablice korisnika
    const columns = [
      { name: 'KorisnikID',   label: 'ID',      field: 'KorisnikID',   sortable: true },
      { name: 'Ime',          label: 'Ime',      field: 'Ime',          sortable: true },
      { name: 'Prezime',      label: 'Prezime',  field: 'Prezime',      sortable: true },
      { name: 'Email',        label: 'Email',    field: 'Email',        sortable: true },
      { name: 'Uloga',        label: 'Uloga',    field: 'Uloga',        sortable: true },
      { name: 'status_racuna', label: 'Status',  field: 'status_racuna', sortable: true },
      { name: 'actions',      label: 'Akcije',   field: 'actions' }
    ]

    // Korisnici filtrirani prema pretrazi i odabranoj ulozi
    const filtrianiKorisnici = computed(() => {
      return sviKorisnici.value.filter(u => {
        const ulogaOk = filterUloga.value === 'Sve' || u.Uloga === filterUloga.value
        const searchOk = !searchKorisnik.value ||
          `${u.Ime} ${u.Prezime} ${u.Email}`.toLowerCase().includes(searchKorisnik.value.toLowerCase())
        return ulogaOk && searchOk
      })
    })

    // ─── SPORTOVI ─────────────────────────────────────────────
    const sportovi = ref([])
    const loadingSportovi = ref(false)
    const noviSport = ref('')         // unos naziva novog sporta
    const dodajeSport = ref(false)    // loading stanje gumba
    const sportPoruka = ref('')       // povratna poruka korisniku
    const sportGreska = ref(false)    // true = greška, false = uspjeh

    // ─── DOHVAT PODATAKA ─────────────────────────────────────
    // Paralelni dohvat svih potrebnih podataka za dashboard
    const ucitajSve = async () => {
      loadingDashboard.value = true
      try {
        const [kRes, oRes, dRes, rRes] = await Promise.all([
          fetch(`${API}/api/users`),
          fetch(`${API}/api/objects`),
          fetch(`${API}/api/dogadjaji`),
          fetch(`${API}/api/recenzije`)
        ])
        sviKorisnici.value = await kRes.json()
        sviObjekti.value = await oRes.json()
        sviDogadaji.value = await dRes.json()
        sveRecenzije.value = await rRes.json()
      } catch (err) {
        console.error('Greška:', err)
      } finally {
        loadingDashboard.value = false
      }
    }

    // Dohvat liste sportova
    const ucitajSportove = async () => {
      loadingSportovi.value = true
      try {
        const res = await fetch(`${API}/api/sportovi`)
        sportovi.value = await res.json()
      } catch (err) {
        console.error('Greška:', err)
      } finally {
        loadingSportovi.value = false
      }
    }

    // Inicijalno učitavanje podataka pri montiranju komponente
    onMounted(async () => {
      await ucitajSve()
      await ucitajSportove()
    })

    // ─── AKCIJE – KORISNICI ───────────────────────────────────

    // Brisanje korisnika i uklanjanje iz lokalne liste
    const deleteUser = async (id) => {
      try {
        await fetch(`${API}/api/users/${id}`, { method: 'DELETE' })
        sviKorisnici.value = sviKorisnici.value.filter(u => u.KorisnikID !== id)
      } catch (err) {
        console.error('Greška:', err)
      }
    }

    // Prebacivanje statusa korisnika između Aktivan i Blokiran
    const toggleBlokiranje = async (user) => {
      const noviStatus =
        user.status_racuna === 'Blokiran'
          ? 'Aktivan'
          : 'Blokiran'

      try {
        await fetch(`${API}/api/users/${user.KorisnikID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status_racuna: noviStatus
          })
        })
        // Lokalno ažuriranje bez ponovnog dohvata s API-ja
        user.status_racuna = noviStatus
      } catch (err) {
        console.error('Greška:', err)
      }
    }

    // ─── AKCIJE – DASHBOARD ───────────────────────────────────

    // Odobravanje objekta i lokalno ažuriranje statusa
    const odobriObjekt = async (id) => {
      try {
        await fetch(`${API}/api/objects/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Odobren' })
        })
        const obj = sviObjekti.value.find(o => o.id === id)
        if (obj) obj.Status = 'Odobren'
      } catch (err) {
        console.error('Greška:', err)
      }
    }

    // Odbijanje objekta i lokalno ažuriranje statusa
    const odbijObjekt = async (id) => {
      try {
        await fetch(`${API}/api/objects/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Odbijen' })
        })
        const obj = sviObjekti.value.find(o => o.id === id)
        if (obj) obj.Status = 'Odbijen'
      } catch (err) {
        console.error('Greška:', err)
      }
    }

    // ─── AKCIJE – SPORTOVI ────────────────────────────────────

    // Dodavanje novog sporta; spriječava prazne unose
    const dodajSport = async () => {
      if (!noviSport.value.trim()) return
      dodajeSport.value = true
      sportPoruka.value = ''
      try {
        const res = await fetch(`${API}/api/sportovi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ NazivSporta: noviSport.value.trim() })
        })
        const data = await res.json()
        if (data.error) {
          sportPoruka.value = data.error
          sportGreska.value = true
        } else {
          // Dodaj sport u lokalnu listu bez ponovnog dohvata
          sportovi.value.push({ SportID: data.id, NazivSporta: noviSport.value.trim() })
          noviSport.value = ''
          sportPoruka.value = 'Sport uspješno dodan!'
          sportGreska.value = false
        }
      } catch  {
        sportPoruka.value = 'Greška pri dodavanju.'
        sportGreska.value = true
      } finally {
        dodajeSport.value = false
      }
    }

    // Brisanje sporta i uklanjanje iz lokalne liste
    const obrisiSport = async (id) => {
      try {
        await fetch(`${API}/api/sportovi/${id}`, { method: 'DELETE' })
        sportovi.value = sportovi.value.filter(s => s.SportID !== id)
      } catch (err) {
        console.error('Greška:', err)
      }
    }

    // Formatiranje datuma u hrvatski format (dd. mm. yyyy.)
    const formatDate = (iso) => {
      if (!iso) return '—'
      return new Date(iso).toLocaleDateString('hr-HR')
    }

    return {
      tab,
      // dashboard
      loadingDashboard,
      stats,
      objektiNaCekanju,
      odobriObjekt,
      odbijObjekt,
      // korisnici
      loadingKorisnici,
      columns,
      filtrianiKorisnici,
      searchKorisnik,
      filterUloga,
      deleteUser,
      toggleBlokiranje,
      // sportovi
      sportovi,
      loadingSportovi,
      noviSport,
      dodajeSport,
      sportPoruka,
      sportGreska,
      dodajSport,
      obrisiSport,
      // utils
      formatDate
    }
  }
}
</script>
