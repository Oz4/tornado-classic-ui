<template>
  <div class="column is-half" :key="language">
    <div class="box-stats">
      <div class="tab-with-corner is-left-top">
        {{ $t('statistics') }}
        <span class="selected"
          ><NumberFormat :value="selectedStatistic.amount" /> {{ selectedStatisticCurrency }}</span
        >
      </div>
      <div class="box">
        <div class="label">
          {{ $t('anonymitySet') }}
          <b-tooltip :label="$t('anonymitySetTooltip')" size="is-medium" position="is-top" multilined>
            <button class="button is-primary has-icon">
              <span class="icon icon-info"></span>
            </button>
          </b-tooltip>
        </div>
        <div class="field">
          <i18n v-if="anonimitySet" path="equalUserDeposit">
            <span v-if="anonimitySet > 1 && anonimitySet < 5" slot="only">{{ $t('only') }}</span>
            <b v-if="anonimitySet > 1" slot="n">{{ Number(anonimitySet) }}</b>
            <span slot="equalUserDepositText">{{ $tc('equalUserDepositPlural', Number(anonimitySet)) }}</span>
          </i18n>
          <b-skeleton size="is-large" :active="!anonimitySet" width="200"></b-skeleton>
        </div>
        <template v-if="anonimitySet != 0">
          <div class="label">{{ $t('latestDeposits') }}</div>
          <div
            v-if="latestDeposits && latestDeposits.length && !isFetchingStatisticsEvents"
            class="columns is-small is-multiline"
          >
            <div class="column is-half-small">
              <div class="deposits">
                <div
                  v-for="{ index, depositTime, depositDate } in latestDeposits.slice(0, 5)"
                  :key="index"
                  class="row"
                >
                  <div class="value">{{ Number(index) + 1 }}.</div>
                  <b-tooltip :label="depositDate" size="is-small" position="is-top" multilined>
                    <div class="data">{{ depositTime }}</div>
                  </b-tooltip>
                </div>
              </div>
            </div>
            <div class="column is-half-small">
              <div class="deposits">
                <div
                  v-for="{ index, depositTime, depositDate } in latestDeposits.slice(5, 10)"
                  :key="index"
                  class="row"
                >
                  <div class="value">{{ Number(index) + 1 }}.</div>
                  <b-tooltip :label="depositDate" size="is-small" position="is-top" multilined>
                    <div class="data">{{ depositTime }}</div>
                  </b-tooltip>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="columns is-small is-multiline">
            <div class="column is-half-small">
              <div class="deposits">
                <b-skeleton size="is-large"></b-skeleton>
                <b-skeleton size="is-large"></b-skeleton>
                <b-skeleton size="is-large"></b-skeleton>
                <b-skeleton size="is-large"></b-skeleton>
                <b-skeleton size="is-large"></b-skeleton>
              </div>
            </div>
            <div class="column is-half-small">
              <div class="deposits">
                <b-skeleton size="is-large"></b-skeleton>
                <b-skeleton size="is-large"></b-skeleton>
                <b-skeleton size="is-large"></b-skeleton>
                <b-skeleton size="is-large"></b-skeleton>
                <b-skeleton size="is-large"></b-skeleton>
              </div>
            </div>
          </div>
          <div class="pagination">
            <button
              class="pagination-button"
              v-bind:class="`${isFirstPage ? 'disabled' : 'enabled'}`"
              @click="paginatePrev"
            >
              <b-icon icon="arrow-left" size="is-small" />
            </button>
            <button
              class="pagination-button"
              v-bind:class="`${isLastPage ? 'disabled' : 'enabled'}`"
              @click="paginateNext"
            >
              <b-icon icon="arrow-right" size="is-small" />
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-console */
import { mapState, mapGetters } from 'vuex'
import NumberFormat from '@/components/NumberFormat'

export default {
  components: {
    NumberFormat
  },
  data() {
    return {
      timer: null
    }
  },
  computed: {
    ...mapState('application', [
      'ip',
      'statistic',
      'selectedStatistic',
      'statisticsIndex',
      'isFetchingStatisticsEvents'
    ]),
    ...mapGetters('metamask', ['networkConfig']),
    ...mapGetters('application', ['selectedStatisticCurrency', 'latestDeposits']),
    anonimitySet() {
      const currency = this.selectedStatistic.currency.toLowerCase()
      return this.statistic[currency][this.selectedStatistic.amount].anonymitySet
    },
    isFirstPage() {
      return this.statisticsIndex === 0
    },
    isLastPage() {
      return this.statisticsIndex >= 5000
    },
    language() {
      return this.$i18n.locale
    }
  },
  mounted() {
    if (!this.timer) {
      this.loadEvents()
      this.updateEvents()
    }
  },
  updated() {
    this.updateEvents()
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },
  methods: {
    loadEvents() {
      this.$store.dispatch('application/updateSelectEvents')
    },
    async updateEvents() {
      await this.$store.dispatch('application/updateSelectEventsWithIndex', {
        skip: this.statisticsIndex,
        isRefreshing: true
      })
      this.timer = setTimeout(() => {
        this.updateEvents()
      }, 60 * 1000)
    },
    async paginateNext() {
      if (this.statisticsIndex < 5000) {
        await this.$store.dispatch('application/updateStatisticsIndex', { index: this.statisticsIndex + 10 })
        await this.$store.dispatch('application/updateSelectEventsWithIndex', { skip: this.statisticsIndex })
      }
    },
    async paginatePrev() {
      if (this.statisticsIndex > 0) {
        await this.$store.dispatch('application/updateStatisticsIndex', { index: this.statisticsIndex - 10 })
        await this.$store.dispatch('application/updateSelectEventsWithIndex', { skip: this.statisticsIndex })
      }
    }
  }
}
</script>
