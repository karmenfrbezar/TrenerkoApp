<template>
  <div class="q-pa-md flex flex-center" style="min-height:100vh;">
    <q-card class="q-pa-lg" style="width:380px; max-width:90%;">
      <div class="text-h5 text-center q-mb-md">Uredi profil</div>

      <q-input filled v-model="ime" label="Ime" class="q-mb-md" />
      <q-input filled v-model="prezime" label="Prezime" class="q-mb-md" />
      <q-input filled v-model="email" label="Email" class="q-mb-md" />

      <q-btn color="primary" label="Spremi promjene" class="full-width q-mt-sm" @click="saveProfile" />

      <q-btn
        outline
        color="orange"
        icon="star"
        label="Moji favoriti"
        class="full-width q-mt-sm"
        to="/favoriti"
      />

      <div v-if="message" class="text-green q-mt-md text-center">
        {{ message }}
      </div>

      <q-separator class="q-my-md" />

      <q-input filled v-model="spol" label="Spol" readonly class="q-mb-md" />
      <q-input filled v-model="role" label="Uloga" readonly class="q-mb-md" />
      <q-input filled v-model="status" label="Status računa" readonly class="q-mb-md" />
    </q-card>
  </div>
</template>

<script>
import { ref, inject, onMounted } from 'vue'

export default {
  setup() {
    const mainUser = inject('user')

    const ime = ref('')
    const prezime = ref('')
    const email = ref('')
    const message = ref('')

    const spol = ref('')
    const role = ref('')
    const status = ref('')

    onMounted(() => {
      ime.value = mainUser.value.ime
      prezime.value = mainUser.value.prezime
      email.value = mainUser.value.email

      spol.value = mainUser.value.spol || ''
      role.value = mainUser.value.role || ''
      status.value = mainUser.value.status || ''
    })

    const saveProfile = () => {
      const newIme = ime.value.trim()
      const newPrezime = prezime.value.trim()
      const newEmail = email.value.trim()

      fetch(`http://localhost:3000/api/users/${mainUser.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ime: newIme,
          prezime: newPrezime,
          email: newEmail
        })
      })
        .then(res => res.json())
        .then(() => {
          mainUser.value.ime = newIme
          mainUser.value.prezime = newPrezime
          mainUser.value.email = newEmail
          message.value = "Promjene spremljene"
        })
        .catch(() => {
          message.value = "Greška prilikom spremanja"
        })
    }

    return {
      ime,
      prezime,
      email,
      message,
      spol,
      role,
      status,
      saveProfile
    }
  }
}
</script>

<style>
.full-width {
  width: 100%;
}
</style>