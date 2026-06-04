<template>

  <!-- =====================================================
       STRANICA ZA UREĐIVANJE PROFILA KORISNIKA
       Omogućuje:
       - izmjenu osobnih podataka
       - pregled uloge i statusa računa
       - pristup favoritima
       - pristup vlasničkom dashboardu
  ====================================================== -->

  <div class="q-pa-md flex flex-center" style="min-height:100vh;">

    <!-- Glavna kartica profila -->
    <q-card class="q-pa-lg" style="width:380px; max-width:90%;">

      <!-- Naslov -->
      <div class="text-h5 text-center q-mb-md">
        Uredi profil
      </div>

      <!-- Osnovni podaci koje korisnik može uređivati -->
      <q-input filled v-model="ime" label="Ime" class="q-mb-md" />
      <q-input filled v-model="prezime" label="Prezime" class="q-mb-md" />
      <q-input filled v-model="email" label="Email" class="q-mb-md" />

      <!-- Spremanje promjena -->
      <q-btn
        color="primary"
        label="Spremi promjene"
        class="full-width q-mt-sm"
        @click="saveProfile"
      />

      <!-- Navigacija prema favoritima -->
      <q-btn
        outline
        color="orange"
        icon="star"
        label="Moji favoriti"
        class="full-width q-mt-sm"
        to="/favoriti"
      />

      <!-- Prikazuje se samo vlasnicima objekata -->
      <q-btn
        v-if="isOwner"
        unelevated
        color="purple"
        icon="dashboard"
        label="Vlasnik dashboard"
        class="full-width q-mt-sm"
        to="/dashboard"
      />

      <!-- Poruka nakon spremanja -->
      <div v-if="message" class="text-green q-mt-md text-center">
        {{ message }}
      </div>

      <q-separator class="q-my-md" />

      <!-- Informacije koje korisnik ne može uređivati -->
      <q-input filled v-model="spol" label="Spol" readonly class="q-mb-md" />
      <q-input filled v-model="role" label="Uloga" readonly class="q-mb-md" />
      <q-input filled v-model="status" label="Status računa" readonly class="q-mb-md" />

    </q-card>
  </div>
</template>

<script>
import { ref, computed, inject, onMounted } from 'vue'

export default {
  name: 'EditPage',

  setup() {

    // =====================================================
    // DOHVAĆANJE PRIJAVLJENOG KORISNIKA
    // Koristi provide/inject mehanizam
    // =====================================================
    const mainUser = inject('user')



    // =====================================================
    // REAKTIVNI PODACI PROFILA
    // =====================================================

    // Osnovni podaci za uređivanje
    const ime = ref('')
    const prezime = ref('')
    const email = ref('')

    // Poruka uspjeha ili greške
    const message = ref('')



    // =====================================================
    // PODACI SAMO ZA PRIKAZ
    // =====================================================

    const spol = ref('')
    const role = ref('')
    const status = ref('')



    // =====================================================
    // PROVJERA JE LI KORISNIK VLASNIK OBJEKTA
    // Koristi se za prikaz dashboard gumba
    // =====================================================
    const isOwner = computed(() =>
      role.value?.trim() === 'Vlasnik objekta'
    )



    // =====================================================
    // UČITAVANJE PODATAKA PRI OTVARANJU STRANICE
    // =====================================================
    onMounted(() => {

      // Osnovni podaci
      ime.value = mainUser.value.ime
      prezime.value = mainUser.value.prezime
      email.value = mainUser.value.email

      // Dodatni podaci
      spol.value = mainUser.value.spol || ''
      role.value = mainUser.value.role || ''
      status.value = mainUser.value.status || ''
    })



    // =====================================================
    // SPREMANJE IZMJENA PROFILA
    //
    // 1. Validira unos
    // 2. Šalje PUT zahtjev backendu
    // 3. Ažurira lokalne podatke
    // 4. Prikazuje poruku korisniku
    // =====================================================
    const saveProfile = () => {

      // Uklanjanje praznih znakova
      const newIme = ime.value.trim()
      const newPrezime = prezime.value.trim()
      const newEmail = email.value.trim()

      fetch(`http://localhost:3000/api/users/${mainUser.value.id}`, {

        // Ažuriranje korisnika
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          ime: newIme,
          prezime: newPrezime,
          email: newEmail
        })
      })

        .then(res => res.json())

        .then(() => {

          // Ažuriranje lokalnog korisnika
          mainUser.value.ime = newIme
          mainUser.value.prezime = newPrezime
          mainUser.value.email = newEmail

          // Poruka uspjeha
          message.value = "Promjene spremljene"
        })

        .catch(() => {

          // Poruka greške
          message.value = "Greška prilikom spremanja"
        })
    }



    // =====================================================
    // VARIJABLE I FUNKCIJE DOSTUPNE TEMPLATE-U
    // =====================================================
    return {
      ime,
      prezime,
      email,
      message,
      spol,
      role,
      status,
      isOwner,
      saveProfile
    }
  }
}
</script>

<style>

/* Gumbi zauzimaju cijelu širinu kartice */
.full-width {
  width: 100%;
}

</style>
