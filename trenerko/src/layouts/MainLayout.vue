<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Trenerko</q-toolbar-title>

        <!-- SVI -->
        <q-btn flat label="Početna" to="/" />
        <q-btn flat label="Sportski objekti" to="/mapa" />
        <q-btn flat label="Pretraživanje" to="/pretraga" />
        <q-btn flat label="Recenzije" to="/recenzije" />

        

        <!-- VLASNIK + ADMIN -->
        <q-btn v-if="isOwnerOrAdmin" flat label="Dodaj objekt" to="/unosobjekata" />

        <!-- ADMIN ONLY -->
        <q-btn
          v-if="isAdmin"
          unelevated
          color="orange"
          icon="shield"
          label="Admin"
          to="/admin"
          class="q-ml-md"
        />

        <q-space />

        <!-- AUTH -->
        <template v-if="!currentUser">
          <q-btn flat label="Login" to="/login" class="bg-orange text-white" />
          <q-btn flat label="Registracija" to="/registracija" />
        </template>

        <template v-else>
          <q-btn
            flat
            :label="currentUser.ime + ' ' + currentUser.prezime"
            to="/profil"
          />
          <q-btn flat label="Logout" @click="logout" class="bg-red text-white" />
        </template>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, provide, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const currentUser = ref(null)

    provide('user', currentUser)

    const logout = () => {
      currentUser.value = null
      router.push('/')
    }

    const isLoggedIn = computed(() => !!currentUser.value)

    const isAdmin = computed(() =>
      currentUser.value?.role?.trim() === 'Admin'
    )

    const isOwnerOrAdmin = computed(() =>
      ['Admin', 'Vlasnik objekta'].includes(currentUser.value?.role?.trim())
    )

    return {
      currentUser,
      logout,
      isLoggedIn,
      isAdmin,
      isOwnerOrAdmin
    }
  }
}
</script>