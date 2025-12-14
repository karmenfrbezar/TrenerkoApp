<template>
  <div class="q-pa-md bg-primary text-white">

    <h2 class="q-mb-md">Lokacije sportskih objekata</h2>

    <!-- KARTA -->
    <div ref="mapEl" class="map-box"></div>

    <!-- KARTICE -->
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


const customIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const mapEl = ref(null)
const objects = ref([])        
let map = null
const markers = []             


//dohvacanje podataka iz backenda
async function loadObjects() {
  try {
    const res = await fetch("http://localhost:3000/api/objects")
    const data = await res.json()
    objects.value = data
  } catch (err) {
    console.error("Greška pri dohvaćanju objekata:", err)
  }
}


// prikaz karte i markera
onMounted(async () => {
  // inicijalizacija karte
  map = L.map(mapEl.value).setView([45.3312, 14.4322], 13)

 
  L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  // 1) učitaj podatke iz baze
  await loadObjects()

  // 2) nacrtaj markere
  objects.value.forEach(obj => {
    const marker = L.marker([obj.lat, obj.lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(obj.naziv)

    markers.push({ id: obj.id, marker })
  })
})


// fokus za marker na karti
function focusObject (obj) {
  if (!map) return

  map.setView([obj.lat, obj.lng], 16)
  map.invalidateSize()

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
