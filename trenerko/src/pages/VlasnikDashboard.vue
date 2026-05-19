<template>
  <q-page class="q-pa-md">

    <q-card flat bordered class="q-mb-md">
      <q-card-section class="bg-purple-6 text-white">
        <div class="text-h6">
          Dashboard vlasnika — {{ mainUser?.ime }} {{ mainUser?.prezime }}
        </div>
      </q-card-section>
    </q-card>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner color="purple" size="2em" />
    </div>

    <div v-else>

      <!-- Statistike -->
      <div class="text-subtitle1 q-mb-sm">Pregled mojih objekata:</div>
      <div class="row q-col-gutter-sm q-mb-lg">
        <div v-for="s in summaryStats" :key="s.label" class="col-6 col-sm-3">
          <q-card flat bordered class="text-center q-pa-md" :class="s.bg">
            <div class="text-caption text-grey-8">{{ s.label }}</div>
            <div class="text-h5 text-weight-bold">{{ s.value }}</div>
          </q-card>
        </div>
      </div>

      <!-- Lista objekata -->
      <div class="text-subtitle1 q-mb-sm">Moji objekti:</div>

      <div v-if="myObjects.length === 0" class="text-grey text-center q-pa-md">
        Još nemaš dodanih objekata.
      </div>

      <q-card
        v-for="obj in myObjects"
        :key="obj.id"
        flat
        bordered
        class="q-mb-sm"
      >
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-subtitle1 text-weight-bold">{{ obj.NazivObjekta }}</div>
            <div class="text-grey-7 text-caption">
              Ocjena: {{ getAvgRating(obj.id).toFixed(1) }}
              | Recenzija: {{ getReviewCount(obj.id) }}
              | Događaja: {{ getEventCount(obj.id) }}
            </div>
          </div>
          <div>
            <q-btn
              flat
              dense
              color="primary"
              icon="bar_chart"
              label="Statistika"
              :to="`/statistika/${obj.id}`"
            />
            <q-btn
              flat
              dense
              color="red"
              icon="delete"
              @click="confirmDelete(obj)"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Lista događaja -->
      <div class="text-subtitle1 q-mt-lg q-mb-sm">Moji događaji:</div>

      <div v-if="myEvents.length === 0" class="text-grey text-center q-pa-md">
        Još nema događaja.
      </div>

      <q-card
        v-for="ev in myEvents"
        :key="ev.DogadajID"
        flat
        bordered
        class="q-mb-sm"
      >
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-subtitle1 text-weight-bold">{{ ev.NazivDogadaja }}</div>
            <div class="text-grey-7 text-caption">
              {{ ev.NazivObjekta }} | {{ formatDate(ev.DatumDogadaja) }} | {{ ev.Status }}
            </div>
            <div v-if="ev.OpisDogadaja" class="text-body2 q-mt-xs">
              {{ ev.OpisDogadaja }}
            </div>
          </div>
          <q-btn
            flat
            dense
            color="red"
            icon="delete"
            @click="deleteEvent(ev.DogadajID)"
          />
        </q-card-section>
      </q-card>

      <!-- Akcije -->
      <div class="row q-col-gutter-sm q-mt-lg">
        <div class="col-12 col-sm-6">
          <q-btn
            unelevated
            color="purple"
            icon="add"
            label="Dodaj novi objekt"
            class="full-width"
            to="/unosobjekata"
          />
        </div>
        <div class="col-12 col-sm-6">
          <q-btn
            unelevated
            color="green"
            icon="event"
            label="Dodaj novi događaj"
            class="full-width"
            @click="eventDialog = true"
          />
        </div>
      </div>

    </div>

    <!-- Dialog za potvrdu brisanja objekta -->
    <q-dialog v-model="deleteDialog">
      <q-card style="min-width: 320px;">
        <q-card-section>
          <div class="text-h6">Brisanje objekta</div>
        </q-card-section>
        <q-card-section>
          Jesi li siguran da želiš obrisati objekt
          <b>{{ objectToDelete?.NazivObjekta }}</b>?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn flat color="red" label="Obriši" @click="deleteObject" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog za dodavanje događaja -->
    <q-dialog v-model="eventDialog">
      <q-card style="min-width: 360px;">
        <q-card-section>
          <div class="text-h6">Novi događaj</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select
            v-model="newEvent.ObjektID"
            :options="objectOptions"
            option-value="id"
            option-label="label"
            emit-value
            map-options
            outlined
            dense
            label="Objekt"
          />
          <q-input v-model="newEvent.NazivDogadaja" outlined dense label="Naziv" />
          <q-input
            v-model="newEvent.OpisDogadaja"
            outlined
            dense
            label="Opis"
            type="textarea"
            autogrow
          />
          <q-input
            v-model="newEvent.DatumDogadaja"
            outlined
            dense
            label="Datum (YYYY-MM-DD HH:MM:SS)"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn unelevated color="green" label="Spremi" @click="saveEvent" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { ref, computed, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API = 'http://localhost:3000'

export default {
  name: 'VlasnikDashboard',
  setup() {
    const mainUser = inject('user')
    const router = useRouter()

    const objects = ref([])
    const reviews = ref([])
    const events = ref([])
    const loading = ref(true)

    const deleteDialog = ref(false)
    const objectToDelete = ref(null)

    const eventDialog = ref(false)
    const newEvent = ref({
      ObjektID: null,
      NazivDogadaja: '',
      OpisDogadaja: '',
      DatumDogadaja: ''
    })

    onMounted(async () => {
      if (!mainUser.value || mainUser.value.role?.trim() !== 'Vlasnik objekta') {
        router.push('/')
        return
      }
      await loadData()
    })

    const loadData = async () => {
      try {
        const [oRes, rRes, eRes] = await Promise.all([
          fetch(`${API}/api/objects`),
          fetch(`${API}/api/recenzije`),
          fetch(`${API}/api/dogadjaji`)
        ])
        objects.value = await oRes.json()
        reviews.value = await rRes.json()
        events.value = await eRes.json()
      } catch (e) {
        console.error('Greška:', e)
      } finally {
        loading.value = false
      }
    }

    const myObjects = computed(() =>
      objects.value.filter(o => o.VlasnikID === mainUser.value?.id)
    )

    const myObjectIds = computed(() => myObjects.value.map(o => o.id))

    const myEvents = computed(() =>
      events.value.filter(e => myObjectIds.value.includes(e.ObjektID))
    )

    const objectOptions = computed(() =>
      myObjects.value.map(o => ({ id: o.id, label: o.NazivObjekta }))
    )

    const getReviewsFor = (id) =>
      reviews.value.filter(r => r.ObjektID === id)

    const getAvgRating = (id) => {
      const rs = getReviewsFor(id)
      if (rs.length === 0) return 0
      return rs.reduce((s, r) => s + Number(r.Ocjena), 0) / rs.length
    }

    const getReviewCount = (id) => getReviewsFor(id).length

    const getEventCount = (id) =>
      events.value.filter(e => e.ObjektID === id).length

    const totalReviews = computed(() =>
      myObjects.value.reduce((s, o) => s + getReviewCount(o.id), 0)
    )

    const overallAvg = computed(() => {
      const allReviews = myObjects.value.flatMap(o => getReviewsFor(o.id))
      if (allReviews.length === 0) return 0
      return allReviews.reduce((s, r) => s + Number(r.Ocjena), 0) / allReviews.length
    })

    const summaryStats = computed(() => [
      { label: 'Moji objekti', value: myObjects.value.length, bg: 'bg-purple-1' },
      { label: 'Događaji', value: myEvents.value.length, bg: 'bg-green-1' },
      { label: 'Recenzije', value: totalReviews.value, bg: 'bg-orange-1' },
      { label: 'Pr. ocjena', value: overallAvg.value.toFixed(1), bg: 'bg-blue-1' }
    ])

    const confirmDelete = (obj) => {
      objectToDelete.value = obj
      deleteDialog.value = true
    }

    const deleteObject = async () => {
      try {
        await fetch(`${API}/api/objects/${objectToDelete.value.id}`, {
          method: 'DELETE'
        })
        objects.value = objects.value.filter(o => o.id !== objectToDelete.value.id)
      } catch (e) {
        console.error('Greška:', e)
      } finally {
        deleteDialog.value = false
        objectToDelete.value = null
      }
    }

    const saveEvent = async () => {
      if (
        !newEvent.value.ObjektID ||
        !newEvent.value.NazivDogadaja ||
        !newEvent.value.DatumDogadaja
      ) {
        return
      }
      try {
        await fetch(`${API}/api/dogadjaji`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent.value)
        })
        await loadData()
        eventDialog.value = false
        newEvent.value = {
          ObjektID: null,
          NazivDogadaja: '',
          OpisDogadaja: '',
          DatumDogadaja: ''
        }
      } catch (e) {
        console.error('Greška:', e)
      }
    }

    const deleteEvent = async (id) => {
      try {
        await fetch(`${API}/api/dogadjaji/${id}`, { method: 'DELETE' })
        events.value = events.value.filter(e => e.DogadajID !== id)
      } catch (e) {
        console.error('Greška:', e)
      }
    }

    const formatDate = (iso) => {
      if (!iso) return '—'
      const d = new Date(iso)
      return d.toLocaleString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      mainUser,
      loading,
      myObjects,
      myEvents,
      summaryStats,
      objectOptions,
      getAvgRating,
      getReviewCount,
      getEventCount,
      deleteDialog,
      objectToDelete,
      confirmDelete,
      deleteObject,
      eventDialog,
      newEvent,
      saveEvent,
      deleteEvent,
      formatDate
    }
  }
}
</script>