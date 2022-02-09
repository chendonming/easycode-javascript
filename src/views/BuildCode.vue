<template>
  <el-card>
    <div class="CustomBuild">
      <el-steps :active="active" simple finish-status="success">
        <el-step title="步骤 1 选择字段信息"></el-step>
        <el-step title="步骤 2 生成"></el-step>
      </el-steps>
      <div v-show="active === 0">
        <data-source/>
        <field-table/>
      </div>
      <generate v-show="active === 1"/>
    </div>
  </el-card>
</template>

<script>
import DataSource from '@/components/DataSource.vue'
import FieldTable from '@/components/FieldTable.vue'
import Generate from '@/components/Generate.vue'
import tableData from '@/mix/tableData.js'

export default {
  name: 'BuildCode',
  components: { Generate, FieldTable, DataSource },
  mixins: [tableData],
  data () {
    return {
      active: 0
    }
  },
  mounted () {
    const components = this.$children?.[0]?.$children
    components.forEach(component => {
      component.$on('nextStep', this.nextStep.bind(this))
      component.$on('previous', this.previous.bind(this))
    })
  },
  methods: {
    previous () {
      this.active--
    },
    nextStep () {
      // 验证
      if (this.active === 0) {
        const valid = this.tableData.some(v => v.operating.length !== 0)
        if (valid) {
          // 下一步
          this.active++
        } else {
          this.$notify.error({
            title: '提示',
            message: '操作栏中至少选择一项'
          })
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin-bottom: 13px;
}

/deep/ .el-table__body tr.current-row > td {
  background-color: var(--danger);
  color: #fff;

  .el-button--text,
  .el-checkbox {
    color: #fff;
  }
}

/deep/ .el-checkbox-group {
  display: inline-block;
}
</style>
