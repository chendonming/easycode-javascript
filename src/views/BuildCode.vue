<template>
  <el-card>
    <div class="CustomBuild">
      <el-steps :active="active" simple finish-status="success">
        <el-step title="步骤 1 选择字段信息"></el-step>
        <el-step title="步骤 2 选择模板"></el-step>
        <el-step title="步骤 3 生成"></el-step>
      </el-steps>
      <div v-show="active === 0">
        <data-source/>
        <field-table/>
      </div>
      <choose-template v-show="active === 1"/>
      <generate v-show="active === 2"/>
    </div>
  </el-card>
</template>

<script>
import DataSource from '@/components/DataSource.vue'
import FieldTable from '@/components/FieldTable.vue'
import ChooseTemplate from '@/components/ChooseTemplate.vue'
import Generate from '@/components/Generate.vue'

export default {
  name: 'BuildCode',
  components: { Generate, ChooseTemplate, FieldTable, DataSource },
  data () {
    return {
      active: 0
    }
  },
  created () {
    this.$on('nextStep', this.nextStep.bind(this))
    this.$on('previous', this.previous.bind(this))
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
      } else if (this.active === 1) {
        console.log('fileList------------>', this.fileList)
        console.log('localFile---------->', this.localFile)
        if (this.fileList.length === 0 && !this.localFile) {
          this.$notify.error({
            title: '提示',
            message: '请选择一个ejs模板'
          })
        } else {
          this.active++
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
  background-color: var(--warning);
  color: #fff;

  .el-button--text,
  .el-checkbox {
    color: #fff;
  }
}

.file-select {
  text-align: left;
  display: flex;
  align-items: baseline;
}

/deep/ .el-checkbox-group {
  display: inline-block;
}

.generate {
  display: flex;
  flex-direction: column;

  .left {
    width: 300px;
  }

  .right {
    flex: 1;
    display: flex;
    align-items: center;
    margin-left: 20px;
  }
}
</style>
