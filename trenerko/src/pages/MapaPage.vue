<template>
  <div class="q-pa-md bg-primary text-white">

    <h2 class="q-mb-md">Lokacije sportskih objekata</h2>

    <!-- karta -->
    <div ref="mapEl" class="map-box"></div>

    <!-- kartice -->
    <div class="row q-col-gutter-md q-mt-md">

      <div
        class="col-12 col-md-4"
        v-for="obj in objects"
        :key="obj.id"
      >
        <q-card class="bg-white text-dark">

          <q-card-section>
            <div class="text-h6">{{ obj.naziv }}</div>
            <div class="text-subtitle2 q-mt-xs">
              {{ obj.opis }}
            </div>
          </q-card-section>

          <q-card-actions>
            <q-btn
              label="Prikaži na karti"
              color="secondary"
              @click="focusObject(obj)"
            />
          </q-card-actions>

        </q-card>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const mapEl = ref(null)
let map

const customIcon = L.icon({
  iconUrl: iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})


// mock podaci za sada
const objects = ref([
  {
    id: 1000,
    naziv: 'Fitness Centar Rijeka',
    opis: 'Moderna teretana sa saunom i grupnim treninzima.',
    lat: 45.3317,
    lng: 14.4325
  },
  {
    id: 1001,
    naziv: 'Bazeni Kantrida',
    opis: 'Kompleks bazena na Kantridi mjesto je vrhunskih sportskih manifestacija, profesionalnog sporta, rekreacije i edukacije, mjesto susreta, druženja i zabave.',
    lat: 45.34103354329373, 
    lng: 14.37303288708569
  },
  {
    id: 1002,
    naziv: 'Gimanstički klub Rijeka',
    opis: 'Treninzi za djecu, mlade i odrasle koji razvijaju svoje gimnastičke elemente i vještine kroz natjecateljske i rekreativne programe uz stručno vodstvo trenera. ',
    lat: 45.33518624370164, 
    lng: 14.445217353476576
  }
])

const markers = []

onMounted(() => {
  map = L.map(mapEl.value).setView([45.3312, 14.4322], 13)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map)

  // dodavanje markera za objekte
  objects.value.forEach(obj => {
    const marker = L.marker([obj.lat, obj.lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(obj.naziv)

    markers.push({ id: obj.id, marker })
  })
})

// fokus na objekt s katice
function focusObject(obj) {
  map.setView([obj.lat, obj.lng], 16)

  const found = markers.find(m => m.id === obj.id)
  if (found) found.marker.openPopup()
}
</script>

<style scoped>
.map-box {
  height: 30rem;
  border-radius: 12px;
  overflow: hidden;
}
</style>
