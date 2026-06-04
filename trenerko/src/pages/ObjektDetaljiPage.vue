<template>
  <q-page class="q-pa-md">

    <!-- Spinner dok se podaci učitavaju -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Poruka ako objekt nije pronađen -->
    <div v-else-if="!objekt" class="text-center q-pa-xl text-grey">
      Objekt nije pronađen.
    </div>

    <div v-else>

      <!-- ZAGLAVLJE OBJEKTA – naziv, adresa, ocjena, karta, opis -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="bg-blue-6 text-white">
          <div class="text-h5">{{ objekt.NazivObjekta }}</div>
          <div class="text-caption">{{ objekt.Adresa }} | {{ objekt.Kontakt }}</div>
        </q-card-section>

        <q-card-section>
          <!-- Prikaz prosječne ocjene i broja recenzija -->
          <div class="row items-center q-mb-sm">
            <q-rating
              :model-value="prosjecnaOcjena"
              max="5"
              size="1.5em"
              color="orange"
              readonly
            />
            <span class="q-ml-sm text-body1 text-weight-bold">
              {{ prosjecnaOcjena.toFixed(1) }} / 5
            </span>
            <span class="q-ml-sm text-grey-6 text-caption">
              ({{ recenzije.length }} recenzija)
            </span>
          </div>

          <!-- LEAFLET KARTA – prikazuje lokaciju objekta -->
          <div ref="mapEl" class="map-box q-mb-md"></div>

          <div class="text-body1 q-mb-sm">{{ objekt.Opis }}</div>

          <!-- AKCIJSKI GUMBI – favoriti, recenzija, statistika -->
          <div class="row q-gutter-sm q-mt-md">
            <!-- Gumb za dodavanje/uklanjanje iz favorita (samo za prijavljene) -->
            <q-btn
              v-if="mainUser"
              unelevated
              :color="jeFavorit ? 'orange' : 'grey-4'"
              :text-color="jeFavorit ? 'white' : 'dark'"
              :icon="jeFavorit ? 'star' : 'star_border'"
              :label="jeFavorit ? 'U favoritima' : 'Dodaj u favorite'"
              @click="toggleFavorit"
              :loading="favoritLoading"
            />
            <!-- Gumb za pisanje recenzije (samo za ulogu Korisnik) -->
            <q-btn
              v-if="mainUser && mainUser.role === 'Korisnik'"
              unelevated
              color="primary"
              icon="rate_review"
              label="Napiši recenziju"
              @click="showRecenzijaForm = !showRecenzijaForm"
            />
            <!-- Link na stranicu statistike objekta -->
            <q-btn
              flat
              color="primary"
              icon="bar_chart"
              label="Statistika"
              :to="`/statistika/${objekt.id}`"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- FORMA ZA RECENZIJU – vidljiva samo kad korisnik klikne gumb -->
      <q-card v-if="showRecenzijaForm && mainUser" flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">Nova recenzija</div>

          <!-- Odabir ocjene zvjezdicama -->
          <div class="q-mb-md text-center">
            <div class="text-grey-7 q-mb-xs">Ocjena:</div>
            <q-rating
              v-model="novaRecenzija.Ocjena"
              size="2em"
              :max="5"
              color="primary"
              icon="star_border"
              icon-selected="star"
            />
          </div>

          <q-input
            v-model="novaRecenzija.Komentar"
            label="Komentar"
            type="textarea"
            outlined
            class="q-mb-md"
          />

          <div class="row q-gutter-sm">
            <q-btn
              unelevated
              color="primary"
              label="Pošalji recenziju"
              :loading="recenzijaLoading"
              @click="posaljiRecenziju"
            />
            <q-btn flat label="Odustani" @click="showRecenzijaForm = false" />
          </div>

          <!-- Povratna poruka (uspjeh ili greška) -->
          <div v-if="recenzijaPoruka" class="q-mt-sm" :class="recenzijaGreska ? 'text-red' : 'text-green'">
            {{ recenzijaPoruka }}
          </div>
        </q-card-section>
      </q-card>

      <!-- NADOLAZECI DOGADAJI – samo aktivni događaji -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">Nadolazeći događaji:</div>

          <div v-if="nadolazaciDogadaji.length === 0" class="text-grey text-center q-pa-md">
            Nema nadolazećih događaja.
          </div>

          <q-item
            v-for="ev in nadolazaciDogadaji"
            :key="ev.DogadajID"
            class="q-mb-xs"
            style="border-radius: 8px; border: 1px solid #e0e0e0;"
          >
            <q-item-section>
              <q-item-label>{{ ev.NazivDogadaja }}</q-item-label>
              <q-item-label caption>{{ formatDate(ev.DatumDogadaja) }} | {{ ev.Status }}</q-item-label>
              <q-item-label v-if="ev.OpisDogadaja" caption>{{ ev.OpisDogadaja }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>
      </q-card>

      <!-- RECENZIJE – lista svih recenzija s ocjenom i komentarom -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">Recenzije korisnika:</div>

          <div v-if="recenzije.length === 0" class="text-grey text-center q-pa-md">
            Još nema recenzija.
          </div>

          <q-card
            v-for="r in recenzije"
            :key="r.RecenzijaID"
            flat
            bordered
            class="q-mb-sm q-pa-sm"
          >
            <div class="row items-center justify-between">
              <span class="text-weight-bold">{{ r.username }}</span>
              <span class="text-grey-5 text-caption">{{ formatDate(r.DatumObjave) }}</span>
            </div>
            <q-rating :model-value="Number(r.Ocjena)" max="5" size="1em" color="orange" readonly />
            <div class="q-mt-xs text-body2">{{ r.Komentar }}</div>
          </q-card>
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script>
import { ref, computed, inject, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// Bazna URL adresa API-ja
const API = 'http://localhost:3000'

// Leaflet marker ikona s ispravnim putanjama za webpack/vite
const markerIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export default {
  name: 'ObjektDetaljiPage',
  setup() {
    const route = useRoute()
    const mainUser = inject('user')  // prijavljeni korisnik iz globalnog provide/inject

    // Podaci objekta, recenzija i događaja
    const objekt = ref(null)
    const recenzije = ref([])
    const dogadaji = ref([])
    const loading = ref(true)

    // Referenca na DOM element karte i instanca Leaflet mape
    const mapEl = ref(null)
    let map = null

    // Stanje favorita za trenutni objekt
    const jeFavorit = ref(false)
    const favoritLoading = ref(false)

    // Stanje forme za novu recenziju
    const showRecenzijaForm = ref(false)
    const novaRecenzija = ref({ Ocjena: 5, Komentar: '' })
    const recenzijaLoading = ref(false)
    const recenzijaPoruka = ref('')
    const recenzijaGreska = ref(false)

    // Paralelni dohvat objekta, recenzija i događaja; provjera favorita ako je korisnik prijavljen
    const ucitaj = async () => {
      const id = Number(route.params.id)
      try {
        const [oRes, rRes, dRes] = await Promise.all([
          fetch(`${API}/api/objects/${id}`),
          fetch(`${API}/api/recenzije/objekt/${id}`),
          fetch(`${API}/api/dogadjaji/objekt/${id}`)
        ])
        objekt.value = await oRes.json()
        recenzije.value = await rRes.json()
        dogadaji.value = await dRes.json()

        // Provjeri je li objekt već u favoritima prijavljenog korisnika
        if (mainUser.value) {
          const fRes = await fetch(`${API}/api/favoriti/${mainUser.value.id}`)
          const favoriti = await fRes.json()
          jeFavorit.value = favoriti.some(f => f.ObjektID === id)
        }
      } catch (err) {
        console.error('Greška:', err)
      } finally {
        loading.value = false
      }
    }

    // Inicijalizacija Leaflet karte nakon što se objekt učita i DOM renderira
    const initMap = () => {
      if (!objekt.value || !mapEl.value) return
      if (!objekt.value.Lat || !objekt.value.Lng) return

      // Uništi staru kartu ako postoji (npr. pri promjeni rute)
      if (map) {
        map.remove()
        map = null
      }

      const lat = parseFloat(objekt.value.Lat)
      const lng = parseFloat(objekt.value.Lng)

      map = L.map(mapEl.value).setView([lat, lng], 15)

      L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      // Marker s popupom na lokaciji objekta
      L.marker([lat, lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(`<b>${objekt.value.NazivObjekta}</b><br>${objekt.value.Adresa}`)
        .openPopup()
    }

    onMounted(async () => {
      await ucitaj()
      // Čekamo sljedeći tick da se DOM ažurira s objekt podacima
      await nextTick()
      initMap()
    })

    // Ako se ruta promijeni (drugi objekt), reinicijaliziramo kartu
    watch(() => route.params.id, async () => {
      loading.value = true
      objekt.value = null
      await ucitaj()
      await nextTick()
      initMap()
    })

    // Prosječna ocjena izračunata iz svih recenzija
    const prosjecnaOcjena = computed(() => {
      if (recenzije.value.length === 0) return 0
      return recenzije.value.reduce((s, r) => s + Number(r.Ocjena), 0) / recenzije.value.length
    })

    // Samo događaji sa statusom Aktivan
    const nadolazaciDogadaji = computed(() =>
      dogadaji.value.filter(d => d.Status === 'Aktivan')
    )

    // Dodaje ili uklanja objekt iz favorita ovisno o trenutnom stanju
    const toggleFavorit = async () => {
      if (!mainUser.value) return
      favoritLoading.value = true
      const id = Number(route.params.id)
      try {
        if (jeFavorit.value) {
          await fetch(`${API}/api/favoriti`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ KorisnikID: mainUser.value.id, ObjektID: id })
          })
          jeFavorit.value = false
        } else {
          await fetch(`${API}/api/favoriti`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ KorisnikID: mainUser.value.id, ObjektID: id })
          })
          jeFavorit.value = true
        }
      } catch (err) {
        console.error('Greška:', err)
      } finally {
        favoritLoading.value = false
      }
    }

    // Validacija, slanje recenzije i osvježavanje liste recenzija
    const posaljiRecenziju = async () => {
      if (!novaRecenzija.value.Komentar.trim()) {
        recenzijaPoruka.value = 'Komentar ne može biti prazan.'
        recenzijaGreska.value = true
        return
      }
      recenzijaLoading.value = true
      recenzijaPoruka.value = ''
      const id = Number(route.params.id)
      try {
        await fetch(`${API}/api/recenzije`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            KorisnikID: mainUser.value.id,
            ObjektID: id,
            Ocjena: novaRecenzija.value.Ocjena,
            Komentar: novaRecenzija.value.Komentar
          })
        })
        recenzijaPoruka.value = 'Recenzija dodana!'
        recenzijaGreska.value = false
        novaRecenzija.value = { Ocjena: 5, Komentar: '' }
        showRecenzijaForm.value = false
        // Osvježi listu recenzija nakon uspješnog slanja
        const rRes = await fetch(`${API}/api/recenzije/objekt/${id}`)
        recenzije.value = await rRes.json()
      } catch {
        recenzijaPoruka.value = 'Greška pri slanju.'
        recenzijaGreska.value = true
      } finally {
        recenzijaLoading.value = false
      }
    }

    // Formatiranje datuma u hrvatski format s vremenom (dd. mm. yyyy. hh:mm)
    const formatDate = (iso) => {
      if (!iso) return '—'
      return new Date(iso).toLocaleString('hr-HR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    }

    return {
      mainUser,
      objekt,
      recenzije,
      loading,
      mapEl,
      prosjecnaOcjena,
      nadolazaciDogadaji,
      jeFavorit,
      favoritLoading,
      showRecenzijaForm,
      novaRecenzija,
      recenzijaLoading,
      recenzijaPoruka,
      recenzijaGreska,
      toggleFavorit,
      posaljiRecenziju,
      formatDate
    }
  }
}
</script>

<style scoped>
/* Fiksna visina karte s blago zaobljenim rubovima */
.map-box {
  height: 280px;
  border-radius: 10px;
  overflow: hidden;
  z-index: 0;
}
</style>
