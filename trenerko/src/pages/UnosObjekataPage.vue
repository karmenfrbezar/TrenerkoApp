<template>
  <q-page class="q-pa-md">

    <!-- NASLOV STRANICE -->
    <h1 class="text-h4 q-mb-lg">Unos novog sportskog objekta</h1>

    <!-- ================= STATUS PORUKA ================= -->
    <q-banner
      v-if="statusMessage"
      :class="statusType === 'success'
        ? 'bg-green-2 text-green-10'
        : 'bg-red-2 text-red-10'"
      class="q-mb-md"
    >
      {{ statusMessage }}
    </q-banner>

    <!-- ================= FORM CARD ================= -->
    <q-card class="q-pa-md">

      <!-- Q-FORM SUBMIT HANDLING -->
      <q-form @submit.prevent="submitObject" class="q-gutter-md">

        <!-- NAZIV OBJEKTA -->
        <q-input
          v-model="objectForm.naziv"
          label="Naziv teretane/objekta"
          :rules="[val => !!val || 'Naziv je obavezan']"
        />

        <!-- ADRESA -->
        <q-input
          v-model="objectForm.adresa"
          label="Adresa"
          :rules="[val => !!val || 'Adresa je obavezna']"
        />

        <!-- KONTAKT -->
        <q-input
          v-model="objectForm.kontakt"
          label="Kontakt (telefon ili e-mail)"
          :rules="[val => !!val || 'Kontakt je obavezan']"
        />

        <!-- OPIS -->
        <q-input
          v-model="objectForm.opis"
          type="textarea"
          label="Opis objekta"
          autogrow
        />

        <!-- ================= LOKACIJA (LAT / LNG) ================= -->
        <div class="row q-col-gutter-md">

          <!-- LATITUDE -->
          <q-input
            class="col-6"
            v-model.number="objectForm.lat"
            type="number"
            step="any"
            label="Geografska širina (Lat)"
            :rules="[val => val !== null || 'Širina je obavezna']"
          />

          <!-- LONGITUDE -->
          <q-input
            class="col-6"
            v-model.number="objectForm.lng"
            type="number"
            step="any"
            label="Geografska dužina (Lng)"
            :rules="[val => val !== null || 'Dužina je obavezna']"
          />
        </div>

        <!-- VLASNIK ID (DISABLED) -->
        <q-input
          v-model.number="objectForm.vlasnikId"
          label="ID vlasnika"
          disable
        />

        <!-- SUBMIT BUTTON -->
        <q-btn
          label="Unesi novi objekt"
          type="submit"
          color="positive"
          :loading="isSubmitting"
        />

      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

// ================= API ENDPOINT =================
const API_URL = 'http://localhost:3000/api/unosobjekata'

// ================= MOCK LOGGED USER =================
// (trenutno hardkodirano, kasnije dolazi iz auth sistema)
const LOGGED_IN_USER_ID = 1

// ================= FORM STATE =================
const objectForm = ref({
  naziv: '',
  adresa: '',
  opis: '',
  kontakt: '',
  lat: null,
  lng: null,
  vlasnikId: LOGGED_IN_USER_ID
})

// ================= UI STATE =================
const isSubmitting = ref(false)
const statusMessage = ref(null)
const statusType = ref(null)

// ================= SUBMIT FUNKCIJA =================
async function submitObject () {

  // start loading state
  isSubmitting.value = true

  // reset statusa prije novog requesta
  statusMessage.value = null
  statusType.value = null

  try {

    // POST zahtjev prema backendu
    await axios.post(API_URL, objectForm.value)

    // SUCCESS PORUKA
    statusMessage.value = 'Sportski objekt uspješno unesen.'
    statusType.value = 'success'

    // RESET FORME nakon uspješnog unosa
    objectForm.value = {
      naziv: '',
      adresa: '',
      opis: '',
      kontakt: '',
      lat: null,
      lng: null,
      vlasnikId: LOGGED_IN_USER_ID
    }

  } catch (error) {

    // ERROR LOG
    console.error('Greška:', error)

    // ERROR PORUKA ZA UI
    statusMessage.value = 'Greška pri unosu objekta.'
    statusType.value = 'error'

  } finally {

    // kraj loading state-a
    isSubmitting.value = false
  }
}
</script>
