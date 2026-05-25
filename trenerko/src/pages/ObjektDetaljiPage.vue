<template>
  <q-page class="q-pa-md">

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!objekt" class="text-center q-pa-xl text-grey">
      Objekt nije pronađen.
    </div>

    <div v-else>

      <!-- ZAGLAVLJE OBJEKTA -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="bg-blue-6 text-white">
          <div class="text-h5">{{ objekt.NazivObjekta }}</div>
          <div class="text-caption">{{ objekt.Adresa }} | {{ objekt.Kontakt }}</div>
        </q-card-section>

        <q-card-section>
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

          <!-- KARTA placeholder -->
          <q-card flat bordered class="q-mb-md bg-grey-2 flex flex-center" style="height: 180px;">
            <div class="text-grey-6 text-center">
              <q-icon name="map" size="2em" /><br/>
              <span class="text-caption">Karta — lokacija objekta</span><br/>
              <span class="text-caption">Lat: {{ objekt.Lat }} | Lng: {{ objekt.Lng }}</span>
            </div>
          </q-card>

          <div class="text-body1 q-mb-sm">{{ objekt.Opis }}</div>

          <!-- AKCIJSKI GUMBI -->
          <div class="row q-gutter-sm q-mt-md">
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
            <q-btn
              v-if="mainUser && mainUser.role === 'Korisnik'"
              unelevated
              color="primary"
              icon="rate_review"
              label="Napiši recenziju"
              @click="showRecenzijaForm = !showRecenzijaForm"
            />
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

      <!-- FORMA ZA RECENZIJU -->
      <q-card v-if="showRecenzijaForm && mainUser" flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">Nova recenzija</div>

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

          <div v-if="recenzijaPoruka" class="q-mt-sm" :class="recenzijaGreska ? 'text-red' : 'text-green'">
            {{ recenzijaPoruka }}
          </div>
        </q-card-section>
      </q-card>

      <!-- NADOLAZECI DOGADAJI -->
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

      <!-- RECENZIJE -->
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
import { ref, computed, inject, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const API = 'http://localhost:3000'

export default {
  name: 'ObjektDetaljiPage',
  setup() {
    const route = useRoute()
    const mainUser = inject('user')

    const objekt = ref(null)
    const recenzije = ref([])
    const dogadaji = ref([])
    const loading = ref(true)

    const jeFavorit = ref(false)
    const favoritLoading = ref(false)

    const showRecenzijaForm = ref(false)
    const novaRecenzija = ref({ Ocjena: 5, Komentar: '' })
    const recenzijaLoading = ref(false)
    const recenzijaPoruka = ref('')
    const recenzijaGreska = ref(false)

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

        // provjeri je li u favoritima
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

    onMounted(ucitaj)

    const prosjecnaOcjena = computed(() => {
      if (recenzije.value.length === 0) return 0
      return recenzije.value.reduce((s, r) => s + Number(r.Ocjena), 0) / recenzije.value.length
    })

    const nadolazaciDogadaji = computed(() =>
      dogadaji.value.filter(d => d.Status === 'Aktivan')
    )

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
        // reload recenzija
        const rRes = await fetch(`${API}/api/recenzije`)
        const sveRecenzije = await rRes.json()
        recenzije.value = sveRecenzije.filter(r => r.ObjektID === id)
      } catch {
        recenzijaPoruka.value = 'Greška pri slanju.'
        recenzijaGreska.value = true
      } finally {
        recenzijaLoading.value = false
      }
    }

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