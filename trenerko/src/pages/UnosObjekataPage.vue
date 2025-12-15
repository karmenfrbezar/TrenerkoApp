<template>
  <q-page class="q-pa-md">
    <h1 class="text-h4 q-mb-lg">Unos novog sportskog objekta</h1>

    <!-- STATUS PORUKA -->
    <q-banner
      v-if="statusMessage"
      :class="statusType === 'success'
        ? 'bg-green-2 text-green-10'
        : 'bg-red-2 text-red-10'"
      class="q-mb-md"
    >
      {{ statusMessage }}
    </q-banner>

    <q-card class="q-pa-md">
      <q-form @submit.prevent="submitObject" class="q-gutter-md">

        <q-input
          v-model="objectForm.naziv"
          label="Naziv teretane/objekta"
          :rules="[val => !!val || 'Naziv je obavezan']"
        />

        <q-input
          v-model="objectForm.adresa"
          label="Adresa"
          :rules="[val => !!val || 'Adresa je obavezna']"
        />

        <q-input
          v-model="objectForm.kontakt"
          label="Kontakt (telefon ili e-mail)"
          :rules="[val => !!val || 'Kontakt je obavezan']"
        />

        <q-input
          v-model="objectForm.opis"
          type="textarea"
          label="Opis objekta"
          autogrow
        />

        <div class="row q-col-gutter-md">
          <q-input
            class="col-6"
            v-model.number="objectForm.lat"
            type="number"
            step="any"
            label="Geografska širina (Lat)"
            :rules="[val => val !== null || 'Širina je obavezna']"
          />

          <q-input
            class="col-6"
            v-model.number="objectForm.lng"
            type="number"
            step="any"
            label="Geografska dužina (Lng)"
            :rules="[val => val !== null || 'Dužina je obavezna']"
          />
        </div>

        <q-input
          v-model.number="objectForm.vlasnikId"
          label="ID vlasnika"
          disable
        />

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

const API_URL = 'http://localhost:3000/api/unosobjekata'
const LOGGED_IN_USER_ID = 1

const objectForm = ref({
  naziv: '',
  adresa: '',
  opis: '',
  kontakt: '',
  lat: null,
  lng: null,
  vlasnikId: LOGGED_IN_USER_ID
})

const isSubmitting = ref(false)
const statusMessage = ref(null)
const statusType = ref(null)

async function submitObject () {
  isSubmitting.value = true
  statusMessage.value = null
  statusType.value = null

  try {
    await axios.post(API_URL, objectForm.value)

    statusMessage.value = 'Sportski objekt uspješno unesen.'
    statusType.value = 'success'

    // reset forme
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
    console.error('Greška:', error)

    statusMessage.value = 'Greška pri unosu objekta.'
    statusType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>
