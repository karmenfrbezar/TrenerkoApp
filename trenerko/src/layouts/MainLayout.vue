<template>
  <q-layout view="lHh Lpr lFf">

    <q-header elevated class="header">
      <q-toolbar>

        <!-- Hamburger menu za mobitele -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="lt-md"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title class="logo">
          Trenerko
        </q-toolbar-title>

        <!-- Desktop navigacija -->
        <div class="nav gt-sm">
          <q-btn flat label="Početna" to="/" />
          <q-btn flat label="Objekti" to="/pretraga" />
          <q-btn flat label="Događaji" to="/dogadjaji" />
          <q-btn flat label="Karta" to="/mapa" />
          <q-btn flat label="Recenzije" to="/recenzije" />

          <!-- Samo prijavljeni korisnik -->
          <q-btn
            v-if="currentUser"
            flat
            label="Favoriti"
            icon="star"
            to="/favoriti"
          />
          <q-btn
            v-if="currentUser && isKorisnik"
            flat
            label="Interesi"
            icon="sports"
            to="/interesi"
          />

          <!-- Samo vlasnik i admin -->
          <q-btn
            v-if="isOwnerOrAdmin"
            flat
            label="Dodaj objekt"
            to="/unosobjekata"
          />
          <q-btn
            v-if="isOwner"
            flat
            label="Dashboard"
            icon="dashboard"
            to="/dashboard"
          />

          <!-- Samo admin -->
          <q-btn
            v-if="isAdmin"
            color="orange"
            icon="shield"
            label="Admin"
            to="/admin"
          />
        </div>

        <q-space />

        <!-- Desktop auth -->
        <div class="auth gt-sm">
          <template v-if="!currentUser">
            <q-btn flat label="Login" to="/login" />
            <q-btn unelevated color="orange" label="Registracija" to="/registracija" />
          </template>

          <template v-else>
            <q-btn flat icon="person" :label="userName" to="/profil" />
            <q-btn flat icon="logout" color="red" @click="logout" />
          </template>
        </div>

      </q-toolbar>
    </q-header>

    <!-- Mobile drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      bordered
      class="bg-white lt-md"
    >
      <q-list padding>

        <q-item clickable v-ripple to="/" @click="leftDrawerOpen = false">
          <q-item-section>Početna</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/pretraga" @click="leftDrawerOpen = false">
          <q-item-section>Objekti</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/dogadjaji" @click="leftDrawerOpen = false">
          <q-item-section>Događaji</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/mapa" @click="leftDrawerOpen = false">
          <q-item-section>Karta</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/recenzije" @click="leftDrawerOpen = false">
          <q-item-section>Recenzije</q-item-section>
        </q-item>

        <!-- Samo prijavljeni korisnik -->
        <q-item
          v-if="currentUser"
          clickable
          v-ripple
          to="/favoriti"
          @click="leftDrawerOpen = false"
        >
          <q-item-section avatar>
            <q-icon name="star" />
          </q-item-section>
          <q-item-section>Favoriti</q-item-section>
        </q-item>

        <q-item
          v-if="currentUser && isKorisnik"
          clickable
          v-ripple
          to="/interesi"
          @click="leftDrawerOpen = false"
        >
          <q-item-section avatar>
            <q-icon name="sports" />
          </q-item-section>
          <q-item-section>Interesi</q-item-section>
        </q-item>

        <!-- Samo vlasnik i admin -->
        <q-item
          v-if="isOwnerOrAdmin"
          clickable
          v-ripple
          to="/unosobjekata"
          @click="leftDrawerOpen = false"
        >
          <q-item-section>Dodaj objekt</q-item-section>
        </q-item>

        <q-item
          v-if="isOwner"
          clickable
          v-ripple
          to="/dashboard"
          @click="leftDrawerOpen = false"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <!-- Samo admin -->
        <q-item
          v-if="isAdmin"
          clickable
          v-ripple
          to="/admin"
          @click="leftDrawerOpen = false"
        >
          <q-item-section avatar>
            <q-icon name="shield" color="orange" />
          </q-item-section>
          <q-item-section>Admin</q-item-section>
        </q-item>

        <q-separator class="q-my-sm" />

        <!-- Login/Register -->
        <template v-if="!currentUser">
          <q-item clickable v-ripple to="/login" @click="leftDrawerOpen = false">
            <q-item-section>Login</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/registracija" @click="leftDrawerOpen = false">
            <q-item-section>Registracija</q-item-section>
          </q-item>
        </template>

        <!-- User -->
        <template v-else>

          <q-item clickable v-ripple to="/profil" @click="leftDrawerOpen = false">
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>{{ userName }}</q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="logout">
            <q-item-section avatar>
              <q-icon name="logout" color="red" />
            </q-item-section>
            <q-item-section>Logout</q-item-section>
          </q-item>

        </template>

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { ref, computed, provide } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const currentUser = ref(null)

    // Drawer za mobitele
    const leftDrawerOpen = ref(false)

    provide('user', currentUser)

    const logout = () => {
      currentUser.value = null
      router.push('/')
    }

    const role = computed(() => currentUser.value?.role?.trim())

    const isAdmin    = computed(() => role.value === 'Admin')
    const isOwner    = computed(() => role.value === 'Vlasnik objekta')
    const isKorisnik = computed(() => role.value === 'Korisnik')

    const isOwnerOrAdmin = computed(() =>
      ['Admin', 'Vlasnik objekta'].includes(role.value)
    )

    const userName = computed(() =>
      currentUser.value ? `${currentUser.value.ime}` : ''
    )

    return {
      currentUser,
      logout,
      isAdmin,
      isOwner,
      isKorisnik,
      isOwnerOrAdmin,
      userName,
      leftDrawerOpen
    }
  }
}
</script>

<style scoped>
.header {
  background: #272729ec;
}

.logo {
  font-weight: 700;
  color: #308deb;
  letter-spacing: 1px;
}

.nav {
  display: flex;
  gap: 4px;
}

.auth {
  display: flex;
  gap: 6px;
  align-items: center;
}

.q-btn {
  border-radius: 8px;
}

/* Mobile prilagodba */
@media (max-width: 768px) {
  .logo {
    font-size: 18px;
  }
}
</style>
