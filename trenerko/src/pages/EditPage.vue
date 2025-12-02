<template>
  <div class="q-pa-md flex flex-center" style="min-height:100vh;">
    <q-card class="q-pa-lg" style="width:380px; max-width:90%;">
      <div class="text-h5 text-center q-mb-md">Uredi profil</div>

      <!-- Polja za uređivanje -->
      <q-input filled v-model="username" label="Korisničko ime" class="q-mb-md"/>
      <q-input filled v-model="email" label="Email" class="q-mb-md"/>

      <q-btn color="primary" label="Spremi promjene" class="full-width q-mt-sm" @click="saveProfile"/>
      <div v-if="message" class="text-green q-mt-md text-center">{{ message }}</div>

      <q-separator class="q-my-md"/>

      <!-- Polja za read-only prikaz -->
      <q-input filled v-model="gender" label="Spol" readonly class="q-mb-md"/>

    </q-card>
  </div>
</template>

<script>
import { ref, inject, onMounted } from 'vue'

export default {
  setup() {
    const mainUser = inject('user')

    // Edit polja
    const username = ref(mainUser.value.username)
    const email = ref(mainUser.value.email)
    const message = ref('')

    // Read-only polja
    const gender = ref('')


    onMounted(() => {
      // Inicijaliziramo read-only podatke iz mainUser
      gender.value = mainUser.value.gender || 'Nije postavljeno'

    })

    const saveProfile = () => {
      // Ako polje nije upisano, zadržavamo staru vrijednost
      const newUsername = username.value.trim() !== '' ? username.value : mainUser.value.username
      const newEmail = email.value.trim() !== '' ? email.value : mainUser.value.email

      // PUT request za update korisnika
      fetch(`http://localhost:3000/api/user/${mainUser.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, email: newEmail })
      })
      .then(res => res.json())
      .then(() => {
        mainUser.value.username = newUsername
        mainUser.value.email = newEmail
        message.value = "Promjene spremljene"
      })
      .catch(() => {
        message.value = "Greška prilikom spremanja"
      })
    }

    return { username, email, message, gender, saveProfile }
  }
}
</script>

<style>
.full-width { width: 100%; }
</style>
