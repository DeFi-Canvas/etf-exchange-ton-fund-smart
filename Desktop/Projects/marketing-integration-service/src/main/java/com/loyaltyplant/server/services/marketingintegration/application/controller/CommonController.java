package com.loyaltyplant.server.services.marketingintegration.application.controller;

import com.loyaltyplant.server.services.marketingintegration.VersionInfo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.lang.management.ThreadInfo;
import java.lang.management.ThreadMXBean;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.stream.Collectors;

@Controller
public class CommonController {
    @RequestMapping(value = {"/ping", "/${service.name}/ping"})
    @ResponseBody
    public String ping() {
        return "pong";
    }

    @RequestMapping("/uptime")
    @ResponseBody
    public String uptime() {
        final RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        return String.format("Uptime: %s. Started at %s.",
                Duration.ofMillis(runtimeBean.getUptime()),
                Instant.ofEpochMilli(runtimeBean.getStartTime())
        );
    }

    @RequestMapping("/threaddump")
    @ResponseBody
    public String threaddump() {
        final ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        final ThreadInfo[] threadInfos = threadBean.dumpAllThreads(
                threadBean.isObjectMonitorUsageSupported(),
                threadBean.isSynchronizerUsageSupported()
        );
        return String.format("TOTAL threads: %d.\n\n%s",
                threadBean.getThreadCount(),
                Arrays.stream(threadInfos).map(Object::toString).collect(Collectors.joining("\n"))
        );
    }

    @RequestMapping(value = {"/version", "/${service.name}/version"})
    @ResponseBody
    public String version() {
        return String.format("Git branch: %s\n    tags: %s\n    commit time: %s\n    commit ID: %s\nBuilt @ %s by %s.",
                VersionInfo.Git.BRANCH,
                VersionInfo.Git.TAGS,
                VersionInfo.Git.COMMIT_TIME,
                VersionInfo.Git.COMMIT_ID,
                VersionInfo.Build.TIMESTAMP,
                VersionInfo.Build.USER
        );
    }

}
